import time
from proxmoxer import ProxmoxAPI
from src.util.env import get_required_env
from src.util.ldap_sync_realm_httpx import sync_ldap_realm
from src.models.enums import SupportedOS, OS_TEMPLATE_MAP
import httpx
import re
import asyncio
UPID_RE = re.compile(r"UPID:(?P<node>[^:]+):")
proxmox = ProxmoxAPI(
    get_required_env("PROXMOX_HOST"),
    port=8006,
    user="root@pam",
    token_name="guac-api",
    token_value=get_required_env("PROXMOX_TOKEN"),
    verify_ssl=False,
    timeout=30  # default = 5 seconds
)
def wait_for_vm_ready(node: str, vmid: int, timeout: int = 20):
    """
    Wait for Proxmox VM to be fully ready (unlocked) after clone.
    """
    for _ in range(timeout):
        config = proxmox.nodes(node).qemu(vmid).config.get()
        if not config.get("lock"):  # No lock, safe to continue
            return True
        time.sleep(1)
    return False

def parse_smart_attributes(smart_data):
    attributes = {attr["name"]: attr for attr in smart_data.get("attributes", [])}
    
    return {
        "Health": smart_data.get("health", "UNKNOWN"),
        "Power_On_Hours": attributes.get("Power_On_Hours", {}).get("raw"),
        "Temperature (C)": attributes.get("Temperature_Celsius", {}).get("value"),
        "Reallocated_Sector_Ct": attributes.get("Reallocated_Sector_Ct", {}).get("raw"),
        "Current_Pending_Sector": attributes.get("Current_Pending_Sector", {}).get("raw"),
        "Offline_Uncorrectable": attributes.get("Offline_Uncorrectable", {}).get("raw"),
        "Command_Timeout": attributes.get("Command_Timeout", {}).get("raw"),
        "UDMA_CRC_Error_Count": attributes.get("UDMA_CRC_Error_Count", {}).get("raw"),
    }

CPU_THRESHOLD = 0.8
MEM_THRESHOLD = 0.9
IO_DELAY_THRESHOLD = 35.0

def is_overloaded(node_metrics: dict) -> bool:
    return (
        node_metrics.get("CPU", 0) > CPU_THRESHOLD or
        node_metrics.get("Memory", 0) > MEM_THRESHOLD or
        node_metrics.get("IO_delay", 0) > IO_DELAY_THRESHOLD
    )

def select_idle_target(metrics: dict, exclude_node: str) -> str | None:
    candidates = {
        node: m for node, m in metrics.items()
        if node != exclude_node and not is_overloaded(m)
    }
    if not candidates:
        return None
    # Sort by lowest CPU, then MEM, then IO delay
    sorted_nodes = sorted(
        candidates.items(),
        key=lambda item: (item[1]["cpu"], item[1]["mem"], item[1]["io_delay"])
    )
    return sorted_nodes[0][0]

# HTTPX-based Migration Function

def migrate_vm_httpx(
    host: str,
    source_node: str,
    vmid: int,
    target_node: str,
    username: str,
    password: str,
    with_local_disks: bool = False,
    online: bool = True,
    verify_ssl: bool = False
) -> dict:
    """
    Migrate a VM via the Proxmox API using httpx.

    :param host: Proxmox API host (e.g. https://proxmox.local:8006)
    :param source_node: Node where the VM currently runs
    :param vmid: The VM ID to migrate
    :param target_node: Node to migrate the VM to
    :param username: Proxmox username (e.g. root@pam)
    :param password: Proxmox password
    :param with_local_disks: Whether to migrate local disks (set to True if VM uses local-lvm)
    :param online: Whether to attempt online migration
    :param verify_ssl: Verify HTTPS certs (use False if self-signed)
    :return: Response JSON or error
    """

    with httpx.Client(verify=verify_ssl) as client:
        # 1. Authenticate
        auth_resp = client.post(
            f"{host}/api2/json/access/ticket",
            data={"username": username, "password": password}
        )
        auth_resp.raise_for_status()
        auth_data = auth_resp.json()["data"]

        ticket = auth_data["ticket"]
        csrf = auth_data["CSRFPreventionToken"]

        # 2. Prepare headers and cookies
        headers = {"CSRFPreventionToken": csrf}
        cookies = {"PVEAuthCookie": ticket}

        # 3. Prepare migration parameters
        payload = {
            "target": target_node,
            "online": "1" if online else "0"
        }

        if with_local_disks:
            payload["with-local-disks"] = "1"

        # 4. Send migration request
        migrate_resp = client.post(
            f"{host}/api2/json/nodes/{source_node}/qemu/{vmid}/migrate",
            headers=headers,
            cookies=cookies,
            data=payload
        )
        migrate_resp.raise_for_status()
        return migrate_resp.json()

async def wait_for_task_completion(upid: str, node: str, *, timeout: int = 120) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        task_json = proxmox.nodes(node).tasks(upid).status.get()
        data = task_json.get("data", {})
        status = data.get("status")
        exitstatus = data.get("exitstatus")
        if status == "stopped":
            if exitstatus == "OK":
                return
            raise RuntimeError(f"Task failed: {exitstatus}")
        await asyncio.sleep(2)
    raise TimeoutError(f"Task {upid} did not complete in {timeout} seconds")
