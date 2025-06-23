import time
from proxmoxer import ProxmoxAPI
from src.util.env import get_required_env
from src.util.ldap_sync_realm_httpx import sync_ldap_realm
from src.models.enums import SupportedOS, OS_TEMPLATE_MAP

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
    }
