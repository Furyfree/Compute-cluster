from fastapi import APIRouter

from src.api.services import proxmox_service

router = APIRouter(prefix="/proxmox", tags=["Proxmox"])


# VM
@router.get("/vms", summary="List all VMs")
def get_vms():
    """Get a list of all virtual machines across all nodes"""
    return proxmox_service.list_vms()

@router.post("/vms/{node}/{vm_id}/start", summary="Start VM")
def start_virtual_machine(node: str, vm_id: int):
    """Start a virtual machine on the specified node"""
    return proxmox_service.start_vm(node, vm_id)

@router.post("/vms/{node}/{vmid}/stop")
def stop_vm(node: str, vmid: int):
    return proxmox_service.stop_vm(node, vmid)

@router.post("/vms/{node}/{vm_id}/restart", summary="Restart VM")
def restart_virtual_machine(node: str, vm_id: int):
    """Restart a virtual machine on the specified node"""
    return proxmox_service.reboot_vm(node, vm_id)


# Containers
@router.get("/containers", summary="List all containers")
def list_all_containers():
    """Get a list of all LXC containers across all nodes"""
    return proxmox_service.list_lxc()

@router.post("/containers/{node}/{container_id}/start", summary="Start Container")
def start_lxc_container(node: str, container_id: int):
    """Start an LXC container on the specified node"""
    return proxmox_service.start_lxc(node, container_id)

@router.post("/containers/{node}/{container_id}/stop", summary="Stop Container")
def stop_lxc_container(node: str, container_id: int):
    """Stop an LXC container on the specified node"""
    return proxmox_service.stop_lxc(node, container_id)

@router.post("/containers/{node}/{container_id}/restart", summary="Restart Container")
def restart_lxc_container(node: str, container_id: int):
    """Restart an LXC container on the specified node"""
    return proxmox_service.reboot_lxc(node, container_id)
