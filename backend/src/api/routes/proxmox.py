from fastapi import APIRouter, Depends
from src.api.auth_deps import get_current_user
from src.services import proxmox_service
from pydantic import BaseModel
from src.models.enums import SupportedOS
from src.services.proxmox_service import provision_vm_from_template
router = APIRouter(prefix="/proxmox", tags=["Proxmox"])

## Provision VM from OS Template
class ProvisionVMRequest(BaseModel):
    user: str
    password: str
    os: SupportedOS

# LDAP Sync
@router.post("/ldap/sync", dependencies=[Depends(get_current_user)], summary="Sync LDAP Changes")
def sync_ldap_to_proxmox():
    """Sync LDAP users and groups to Proxmox (incremental)"""
    result = proxmox_service.sync_ldap_changes()
    return {"message": "LDAP sync completed", "result": result}

@router.get("/ldap/realms", dependencies=[Depends(get_current_user)], summary="List Authentication Realms")
def list_authentication_realms():
    """List all authentication realms to find the correct LDAP realm name"""
    result = proxmox_service.list_realms()
    return {"realms": result}

# VM
@router.get("/vms", dependencies=[Depends(get_current_user)], summary="List all VMs")
def get_vms():
    """Get a list of all virtual machines across all nodes"""
    return proxmox_service.list_vms()

@router.get("/vms/ip", dependencies=[Depends(get_current_user)], summary="Get IP for VM")
def get_virtual_machine_ip(node: str, vm_id: int):
    """"Get the IP address of the virtual machine"""
    return proxmox_service.get_vm_ip(node, vm_id)

@router.post("/vms/{node}/{vm_id}/start", dependencies=[Depends(get_current_user)], summary="Start VM")
def start_virtual_machine(node: str, vm_id: int):
    """Start a virtual machine on the specified node"""
    return proxmox_service.start_vm(node, vm_id)

@router.post("/vms/{node}/{vm_id}/stop", dependencies=[Depends(get_current_user)], summary="Stop VM")
def stop_virtual_machine(node: str, vm_id: int):
    """Stop a virtual machine on the specified node"""
    return proxmox_service.stop_vm(node, vm_id)

@router.post("/vms/{node}/{vm_id}/restart", dependencies=[Depends(get_current_user)], summary="Restart VM")
def restart_virtual_machine(node: str, vm_id: int):
    """Restart a virtual machine on the specified node"""
    return proxmox_service.reboot_vm(node, vm_id)


# Containers
@router.get("/containers", dependencies=[Depends(get_current_user)], summary="List all containers")
def list_all_containers():
    """Get a list of all LXC containers across all nodes"""
    return proxmox_service.list_lxc()

@router.get("/containers/ip", dependencies=[Depends(get_current_user)], summary="Get IP for Container")
def get_lxc_ip(node: str, container_id: int):
    """"Get the IP address of the LXC containers"""
    return proxmox_service.get_lxc_ip(node, container_id)

@router.post("/containers/{node}/{container_id}/start", dependencies=[Depends(get_current_user)], summary="Start Container")
def start_lxc_container(node: str, container_id: int):
    """Start an LXC container on the specified node"""
    return proxmox_service.start_lxc(node, container_id)

@router.post("/containers/{node}/{container_id}/stop", dependencies=[Depends(get_current_user)], summary="Stop Container")
def stop_lxc_container(node: str, container_id: int):
    """Stop an LXC container on the specified node"""
    return proxmox_service.stop_lxc(node, container_id)

@router.post("/containers/{node}/{container_id}/restart", dependencies=[Depends(get_current_user)], summary="Restart Container")
def restart_lxc_container(node: str, container_id: int):
    """Restart an LXC container on the specified node"""
    return proxmox_service.reboot_lxc(node, container_id)
# Node System Report
@router.get("/nodes/{node}/report", dependencies=[Depends(get_current_user)], summary="Get Node Report")
def get_node_system_report(node: str):
    """Get system report from a specific Proxmox node"""
    return proxmox_service.get_node_report(node)
@router.get("/proxmox/nodes/{node}/performance", summary="Get node performance metrics", dependencies=[Depends(get_current_user)])
def node_performance(node: str):
    """Returns CPU, loadavg, memory, and disk usage for a node"""
    return proxmox_service.get_node_performance(node)

@router.post(
    "/proxmox/nodes/{node}/provision",
    summary="Provision a new VM from OS template",
    dependencies=[Depends(get_current_user)]
)
def provision_from_os(node: str, payload: ProvisionVMRequest):
    return provision_vm_from_template(
        node=node,
        os=payload.os,  # This is now SupportedOS enum
        user=payload.user,
        password=payload.password
    )
