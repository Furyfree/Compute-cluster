from proxmoxer import ProxmoxAPI
from src.util.env import get_required_env
from src.util.ldap_sync_realm_httpx import sync_ldap_realm
from src.models.enums import SupportedOS, OS_TEMPLATE_MAP
from src.models.models import ProvisionRequest, ProvisionResponse
import src.util.proxmox_util as proxmox_util
import src.services.load_balance_service as load_balance_service
import time
from typing import Dict, Tuple, Union, Literal
import re

proxmox = ProxmoxAPI(
    get_required_env("PROXMOX_HOST"),
    port=8006,
    user="root@pam",
    token_name="guac-api",
    token_value=get_required_env("PROXMOX_TOKEN"),
    verify_ssl=False,
    timeout = 30 #default = 5 seconds
)

def sync_ldap_changes():
    """Sync LDAP users and groups to Proxmox"""
    result = sync_ldap_realm(
        host= get_required_env("PROXMOX_HOST_NAME"),
        realm="LDAP",
        username="root@pam",
        password= get_required_env("PROXMOX_PASSWORD"),
        scope="both",
        remove_vanished="entry;properties",
        dry_run=False,
        verify_ssl=False
    )
    return result

def list_realms():
    """List all authentication realms"""
    return proxmox.access.domains.get()

def list_admin_vms():
    all_vms = []
    for node in proxmox.nodes.get():
        node_name = node["node"]
        vms = proxmox.nodes(node_name).qemu.get()
        for vm in vms:
            all_vms.append({
                "node": node_name,
                "vmid": vm["vmid"],
                "name": vm.get("name", ""),
                "status": vm.get("status", "unknown")
            })
    return all_vms

def list_user_vms(username: str):
    all_vms = list_admin_vms()
    acl = proxmox.access.acl.get()["data"]

    user_vmid_set = set()
    for entry in acl:
        if entry["path"].startswith("/vms/") and username in entry.get("users", []):
            try:
                vmid = int(entry["path"].split("/vms/")[1])
                user_vmid_set.add(vmid)
            except ValueError:
                continue

    return [vm for vm in all_vms if vm["vmid"] in user_vmid_set]

def list_lxc():
    all_lxcs = []
    for node in proxmox.nodes.get():
        node_name = node["node"]
        for lxc in proxmox.nodes(node_name).lxc.get():
            all_lxcs.append({
                "node": node_name,
                "lxcid": lxc["vmid"],
                "name": lxc.get("name", ""),
                "status": lxc.get("status", "unknown")
            })
    return all_lxcs

def start_vm(node, vmid):
    return proxmox.nodes(node).qemu(vmid).status.start.post()

def stop_vm(node, vmid):
    return proxmox.nodes(node).qemu(vmid).status.stop.post()

def reboot_vm(node, vmid):
    return proxmox.nodes(node).qemu(vmid).status.reboot.post()

def delete_vm(node, vmid, purge = True):
    proxmox.nodes(node).qemu(vmid).delete.post(purge=purge)

def start_lxc(node, containerid):
    return proxmox.nodes(node).lxc(containerid).status.start.post()

def stop_lxc(node, containerid):
    return proxmox.nodes(node).lxc(containerid).status.stop.post()

def reboot_lxc(node, containerid):
    return proxmox.nodes(node).lxc(containerid).status.reboot.post()

def delete_lxc(node, containerid, purge = True):
    proxmox.nodes(node).lxc(containerid).delete.post(purge=purge)

def get_vmid_and_node_by_name(name: str) -> tuple[int, str] | None:
    for vm in proxmox.cluster.resources.get(type="vm"):
        if vm.get("name") == name:
            return int(vm["vmid"]), vm["node"]
    return None

def get_node_by_vmid(vmid: int) -> str | None:
    """
    Return the node where a VM with the given VMID is located.
    """
    for vm in proxmox.cluster.resources.get(type="vm"):
        if str(vm["vmid"]) == str(vmid):
            return vm["node"]
    return None

# Proxmox users

def list_users():
    """List all users in Proxmox"""
    return proxmox.access.users.get()

def list_groups():
    """List all groups in Proxmox"""
    return proxmox.access.groups.get()

def get_user_groups(userid: str):
    """Get all groups a user belongs to"""
    user_groups = []
    groups = proxmox.access.groups.get()

    full_userid = userid
    if '@' not in userid:
        full_userid = f"{userid}@LDAP"

    for group in groups:
        group_name = group['groupid']
        if 'users' in group and group['users']:
            user_list = group['users'].split(',')
            if full_userid in user_list or userid in user_list:
                user_groups.append(group_name)

    return {"status": "success", "userid": userid, "groups": user_groups}

# IP

def get_lxc_ip(node, containerid):
    status = proxmox.nodes(node).lxc(containerid).status.current.get()
    network_info = status.get('data', {}).get('network', {})
    for iface_name, iface_data in network_info.items():
        ip = iface_data.get('ip')
        ip6 = iface_data.get('ip6')
        if ip:
            return ip
        if ip6:
            return ip6
    return None

def get_vm_ip(node_name, vmid):
    try:
        agent_info = proxmox.nodes(node_name).qemu(vmid).agent('network-get-interfaces').get()
        for iface in agent_info['result']:
            for ip in iface.get('ip-addresses', []):
                # Skip loopback (127.x.x.x or ::1)
                if ip['ip-address'].startswith('127.') or ip['ip-address'] == '::1':
                    continue
                return ip['ip-address']  # Accept 10.51.x.x and others
    except Exception  as e:
        if "QEMU agent is not running" in str(e):
            return "QEMU agent not running"
        return f"Error retrieving IP '{str(e)}'"

# Proxmox Node Performance and Report

def get_node_report(node):
    return proxmox.nodes(node).report.get()

def get_node_performance(node: str):

    status = proxmox.nodes(node).status.get()

    cpu_usage = round(status.get("cpu", 0.0) * 100, 2)
    load_avg = status.get("loadavg", [])

    mem = status.get("memory", {})
    disk = status.get("rootfs", {})

    mem_total = mem.get("total", 0)
    mem_used = mem.get("used", 0)
    disk_total = disk.get("total", 0)
    disk_used = disk.get("used", 0)

    return {
        "CPU Usage": f"{cpu_usage:.2f}%",
        "Load Average (1m, 5m, 15m)": load_avg,
        "Memory Usage": {
            "Used": f"{mem_used / 1_073_741_824:.2f} GB",
            "Total": f"{mem_total / 1_073_741_824:.2f} GB",
            "Usage Percent": f"{(mem_used / mem_total) * 100:.1f}%" if mem_total else "N/A"
        },
        "Disk Usage": {
            "Used": f"{disk_used / 1_073_741_824:.2f} GB",
            "Total": f"{disk_total / 1_073_741_824:.2f} GB",
            "Usage Percent": f"{(disk_used / disk_total) * 100:.1f}%" if disk_total else "N/A"
        }
    }

def get_node_performance_full (node: str):
    status = proxmox.nodes(node).status.get()
    return status

def get_disk_health(node: str):
    disk_list = proxmox.nodes(node).disks.list.get()
    results = []

    for disk in disk_list:
        dev = disk.get("devpath")
        if not dev:
            continue

        try:
            smart_info = proxmox.nodes(node).disks.smart.get(disk=dev)
            parsed = proxmox_util.parse_smart_attributes(smart_info)
            parsed["Device"] = dev
            results.append(parsed)
        except Exception as e:
            results.append({"Device": dev, "Error": str(e)})

    return results

# Proxmox VM Provisioning Service

def get_next_vmid() -> int:
    existing_vms = proxmox.cluster.resources.get(type="vm")
    existing_ids = [vm["vmid"] for vm in existing_vms if "vmid" in vm]
    return max(existing_ids, default=100) + 1  # start from 101 if none exist

def pick_best_node():
    def score(m: Dict[str, float]) -> float:
        return (m["cpu"] * 4) + (m["mem"] * 3) + (m["disk"] * 2) + m["io_delay"]
    metrics = get_all_node_metrics()
    best = min(metrics.items(), key=lambda kv: score(kv[1]))[0]
    return best

def provision_cloud_init_vm(username: str, password: str, OS: SupportedOS, ssh_key: str = None, vm_name: str = None):
    vmid = get_next_vmid()
    try:
        node = pick_best_node()
        if not node:
            return {"error": "No suitable node found for provisioning."}
    except Exception as e:
        return {"error": f"Error selecting node: {str(e)}"}

def provision_cloud_init_vm_with_retry(node: str, vmid: int, req: ProvisionRequest, retries: int = 5, delay: float = 2.0):
    """
    Retry-safe wrapper for cloud-init config to handle Proxmox file lock errors.
    """
    for attempt in range(retries):
        try:
            proxmox.nodes(node).qemu(vmid).config.post(
                ciuser=req.username,
                cipassword=req.password,
                sshkeys=req.ssh_key,
                ipconfig0="ip=dhcp",
            )
            return {"success": True}
        except Exception as e:
            message = str(e)
            if "lock" in message.lower() and attempt < retries - 1:
                time.sleep(delay)
                continue
            return {"error": f"Failed to configure cloud-init: {message}"}

def wait_for_first_ip(node: str, vmid: int, timeout: int = 120) -> str | None: #Poll the QEMU guest agent until a non‑loopback IPv4 address is returned
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            agent_data = proxmox.nodes(node).qemu(vmid).agent("network-get-interfaces").get()
            for interface in agent_data["result"]:
                for addr in interface.get("ip-addresses", []):
                    ip = addr.get("ip-address")
                    if ip and not ip.startswith("127.") and ":" not in ip:
                        return ip
        except Exception:
            pass
        time.sleep(3)
    return None

def clone_vm(source_node: str, source_vmid: int, target_vmid: int, vm_name: str):
    try:
        result = proxmox.nodes(source_node).qemu(source_vmid).clone.post(
            newid=target_vmid,
            name=vm_name,
            full=1,
            target=source_node,
        )

        upid = result["data"] if isinstance(result, dict) else result
        await proxmox_util.wait_for_task_completion(upid)
        return {"success": True, "upid": upid}

    except Exception as e:
        return {"error": f"Failed to clone VM: {str(e)}"}

def cloud_init_vm(node: str, vmid: int, req: ProvisionRequest):
    try:
        return proxmox.nodes(node).qemu(vmid).config.post(
            ciuser=req.username,
            cipassword=req.password,
            sshkeys=req.ssh_key,
            ipconfig0="ip=dhcp",
        )
    except Exception as e:
        return {"error": f"Failed to configure cloud-init: {str(e)}"}

# Load Balancer: Raw node metrics for load decisions
def get_all_node_metrics(): #NO endpoint, used internally
    metrics = {}
    for node in proxmox.nodes.get():
        node_name = node['node']
        status = proxmox.nodes(node_name).status.get()
        metrics[node_name] = {
            "cpu": status.get("cpu", 0.0),  # float (0.0 to 1.0)
            "mem": status.get("mem", 0) / status.get("maxmem", 1),
            "disk": status.get("disk", 0) / status.get("maxdisk", 1),
            "io_delay": status.get("iodelay", 0.0),
        }
    return metrics

def get_running_vms_by_node(node): #NO endpoint, used internally
    return [
        vm for vm in proxmox.nodes(node).qemu.get()
        if vm.get("status") == "running" and "vmid" in vm
    ]

def migrate_vm(vmid: int, source_node: str, target_node: str): #NO endpoint, used internally
    try:
        result = proxmox_util.migrate_vm_httpx(
            host=get_required_env("PROXMOX_HOST_NAME"),
            source_node=source_node,
            vmid=vmid,
            target_node=target_node,
            username=get_required_env("PROXMOX_USERNAME"),
            password=get_required_env("PROXMOX_PASSWORD"),
            with_local_disks=True,
            online=True,
            verify_ssl=False
        )
        return result
    except Exception as e:
        return {"error": str(e)}

def manual_load_balance():
    try:
        load_balance_service.rebalance()
        return {"status": "success", "message": "Load balancing completed."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
