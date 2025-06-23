from proxmoxer import ProxmoxAPI
from src.util.env import get_required_env
from src.util.ldap_sync_realm_httpx import sync_ldap_realm
from src.models.enums import SupportedOS, OS_TEMPLATE_MAP
from src.util.proxmox_util import wait_for_vm_ready
import time
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

def list_vms():
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

    for group in groups:
        group_name = group['groupid']
        members = proxmox.access.groups(group_name).get()
        if any(member['userid'] == userid for member in members if 'userid' in member):
            user_groups.append(group_name)
    return {"status": "success", "userid": userid, "groups": user_groups}

def update_user_groups(userid: str, groups: list[str]):
    """Update user's group"""
    current_groups = get_user_groups(userid).get("groups", [])

    for group in current_groups:
        if group not in groups:
            proxmox.access.groups(group).user(userid).delete()

    for group in groups:
        if group not in current_groups:
            proxmox.access.groups(group).user(userid).put()

    return {
        "status": "success",
        "message": f"Updated group membership for {userid}",
        "groups": groups
    }

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
    return status.json()




# Proxmox VM Provisioning Service

def get_next_vmid() -> int:
    """
    Returns the next available VM ID (max + 1).
    """
    existing_vms = proxmox.cluster.resources.get(type="vm")
    existing_ids = [vm["vmid"] for vm in existing_vms if "vmid" in vm]
    return max(existing_ids, default=100) + 1  # start from 101 if none exist

def provision_vm_from_template(node: str, os: SupportedOS, user: str, password: str, ssh_keys: str) -> dict:
    try:
        template_vmid = OS_TEMPLATE_MAP[os]
        new_vmid = get_next_vmid()
        warnings = []
        # Step 1: Clone the VM
        proxmox.nodes(node).qemu(template_vmid).clone.post(
            newid=new_vmid,
            name=f"{os.value.lower()}-{new_vmid}",
            full=1,
            target=node
        )

        # Step 2: Wait for clone to finish
        if not wait_for_vm_ready(node, new_vmid, timeout=60):
            return {"status": "error", "message": f"Timeout waiting for VM {new_vmid} to become available."}

        # Step 3: Configure cloud-init
        proxmox.nodes(node).qemu(new_vmid).config.post(
            ciuser=user,
            cipassword=password,
            sshkeys=ssh_keys
        )
        time.sleep(2)  # Ensure config is applied before regenerating cloud-init
        try:
            proxmox.nodes(node).qemu(new_vmid).cloudinit.regen.post(force=1)
        except Exception as e:
            error_msg = str(e)
            if "SSH public key validation error" in error_msg:
                warnings.append("SSH key validation failed. ")
            else:
                return {"status": "error", "message": f"Failed to regenerate cloud-init: {error_msg}"}
        time.sleep(2)  # Allow time for cloud-init regeneration
        # Step 4: Start the VM
        proxmox.nodes(node).qemu(new_vmid).status('start').post()

        return {
            "status": "success",
            "vmid": new_vmid,
            "node": node,
            "os": os.value,
            "warnings": warnings
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
