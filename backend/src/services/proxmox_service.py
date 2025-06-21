from proxmoxer import ProxmoxAPI
from src.util.env import get_required_env
from src.util.ldap_sync_realm_httpx import sync_ldap_realm
proxmox = ProxmoxAPI(
    get_required_env("PROXMOX_HOST"),
    port=8006,
    user="root@pam",
    token_name="guac-api",
    token_value=get_required_env("PROXMOX_TOKEN"),
    verify_ssl=False
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
def full_ldap_sync():
    """One-time full sync to catch any missed changes"""
    return proxmox.access.domains("LDAP").sync.post(scope="both",remove_vanished="both")

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

def get_vm_ip(node, vmid):
    return None

def start_lxc(node, containerid):
    return proxmox.nodes(node).lxc(containerid).status.start.post()

def stop_lxc(node, containerid):
    return proxmox.nodes(node).lxc(containerid).status.stop.post()

def reboot_lxc(node, containerid):
    return proxmox.nodes(node).lxc(containerid).status.reboot.post()

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