from fastapi import APIRouter, Depends
from src.api.auth_deps import get_current_user
from src.services import proxmox_service

router = APIRouter(prefix="/proxmox", tags=["Proxmox"])


# VM
@router.get("/vms", dependencies=[Depends(get_current_user)], summary="List all VMs")
def get_vms():
    """Get a list of all virtual machines across all nodes"""
    return proxmox_service.list_vms()

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
