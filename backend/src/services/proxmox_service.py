from proxmoxer import ProxmoxAPI
from src.util.env import get_required_env

proxmox = ProxmoxAPI(
    get_required_env("PROXMOX_HOST"),
    port=8006,
    user="root@pam",
    token_name="guac-api",
    token_value=get_required_env("PROXMOX_TOKEN"),
    verify_ssl=False
)

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

def start_lxc(node, vmid):
    return proxmox.nodes(node).lxc(vmid).status.start.post()

def stop_lxc(node, vmid):
    return proxmox.nodes(node).lxc(vmid).status.stop.post()

def reboot_lxc(node, vmid):
    return proxmox.nodes(node).lxc(vmid).status.reboot.post()

def create_proxmox_user(username: str, group: str):
    """Opret bruger i Proxmox og tilføj til korrekt gruppe"""
    role_mapping = {
        "user": "PVEVMUser",
        "admin": "PVEAdmin",
        "rootadmin": "Administrator"
    }

    user_id = f"{username}@ldap"

    try:
        # Opret bruger
        proxmox.access.users.post(userid=user_id, enable=1)

        # Tilføj rolle
        proxmox.access.acl.put(
            path="/",
            users=user_id,
            roles=role_mapping.get(group, "PVEVMUser")
        )

        return {"success": True, "user_id": user_id}
    except Exception as e:
        return {"success": False, "error": str(e)}

def delete_proxmox_user(username: str):
    """Slet bruger fra Proxmox"""
    user_id = f"{username}@ldap"

    try:
        # Slet bruger (dette fjerner også alle ACL entries)
        proxmox.access.users(user_id).delete()
        return {"success": True, "deleted_user": user_id}
    except Exception as e:
        return {"success": False, "error": str(e)}
