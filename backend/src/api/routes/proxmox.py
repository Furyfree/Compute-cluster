from fastapi import APIRouter

from src.api.services import proxmox_service

router = APIRouter(prefix="/proxmox", tags=["Proxmox"])

@router.get("/vms")
def get_vms():
    return proxmox_service.list_vms()

@router.get("/containers")
def get_lxcs():
    return proxmox_service.list_lxc()

@router.post("/vms/{node}/{vmid}/start")
def start_vmid(node: str, vmid: int):
    return proxmox_service.start_vm(node, vmid)

# VM actions
@router.post("/vms/{node}/{vmid}/stop")
def stop_vm(node: str, vmid: int):
    return proxmox_service.stop_vm(node, vmid)

@router.post("/vms/{node}/{vmid}/reboot")
def reboot_vm(node: str, vmid: int):
    return proxmox_service.reboot_vm(node, vmid)

# LXC actions
@router.post("/containers/{node}/{vmid}/start")
def start_lxc(node: str, vmid: int):
    return proxmox_service.start_lxc(node, vmid)

@router.post("/containers/{node}/{vmid}/stop")
def stop_lxc(node: str, vmid: int):
    return proxmox_service.stop_lxc(node, vmid)

@router.post("/containers/{node}/{vmid}/reboot")
def reboot_lxc(node: str, vmid: int):
    return proxmox_service.reboot_lxc(node, vmid)
