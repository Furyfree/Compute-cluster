from fastapi import APIRouter, Depends
from src.api.auth_deps import get_current_user
from src.services import proxmox_service
from pydantic import BaseModel
from src.models.enums import SupportedOS
from src.models.models import ProvisionRequest, ProvisionResponse, GroupRequest
import src.util.provision_worker as provision_worker

router = APIRouter(prefix="/proxmox", tags=["Proxmox"])

# Node endpoints
@router.get("/nodes/{node}/report", dependencies=[Depends(get_current_user)], summary="Get Node Report")
def get_node_system_report(node: str):
    """Get system report from a specific Proxmox node"""
    return proxmox_service.get_node_report(node)

@router.get("/nodes/{node}/performance", summary="Get node performance metrics", dependencies=[Depends(get_current_user)])
def node_performance(node: str):
    """Returns CPU, loadavg, memory, and disk usage for a node"""
    return proxmox_service.get_node_performance(node)

@router.post(
    "/nodes/{node}/provision",
    summary="Provision a new VM from OS template",
    dependencies=[Depends(get_current_user)]
)

@router.get("/nodes/{node}/performance/full", summary="Get full node performance metrics", dependencies=[Depends(get_current_user)])
def node_performance_full(node: str):
    """Returns full performance metrics for a node"""
    return proxmox_service.get_node_performance_full(node)

@router.get("/nodes/{node}/disk/health", summary="Get disk health for a node", dependencies=[Depends(get_current_user)])
def get_disk_health(node: str):
    """Get disk health status for a node"""
    return proxmox_service.get_disk_health(node)
# load balance endpoint
@router.get("/nodes/load-balance", summary="Load balance nodes", dependencies=[Depends(get_current_user)])
def load_balance_nodes():
    """Rebalance VMs across nodes based on current load"""
    return proxmox_service.manual_load_balance()

# VM endpoints
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

@router.delete("/vms/{node}/{vm_id}/delete", dependencies=[Depends(get_current_user)], summary="Delete VM")
def delete_virtual_machine(node: str, vm_id: int):
    """Delete a virtual machine on the specified node"""
    return proxmox_service.delete_vm(node, vm_id)


# Container endpoints
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

@router.delete("/containers/{node}/{container_id}/delete", dependencies=[Depends(get_current_user)], summary="Delete Container")
def delete_lxc_container(node: str, container_id: int):
    """Delete an LXC container on the specified node"""
    return proxmox_service.delete_lxc(node, container_id)


# Proxmox Authentication Management
@router.post("/auth/sync", dependencies=[Depends(get_current_user)], summary="Sync LDAP Changes")
def sync_ldap_to_proxmox():
    """Sync LDAP users and groups to Proxmox"""
    result = proxmox_service.sync_ldap_changes()
    return {"message": "LDAP sync completed", "result": result}

@router.get("/auth/realms", dependencies=[Depends(get_current_user)], summary="List Authentication Realms")
def list_authentication_realms():
    """List all authentication realms to find the correct LDAP realm name"""
    result = proxmox_service.list_realms()
    return {"realms": result}

@router.get("/auth/users/list", dependencies=[Depends(get_current_user)], summary="List All Users")
def list_users():
    """List all users in Proxmox"""
    return proxmox_service.list_users()

@router.get("/auth/groups/list", dependencies=[Depends(get_current_user)], summary="List All Groups")
def list_groups():
    """List all groups in Proxmox"""
    return proxmox_service.list_groups()

@router.get("/auth/users/{userid}/groups", dependencies=[Depends(get_current_user)], summary="Get User's Groups")
def get_user_groups(userid: str):
    """Get all groups a user belongs to"""
    return proxmox_service.get_user_groups(userid)

@router.post("/provision", dependencies=[Depends(get_current_user)], summary="Provision VM from OS Template")
def provision_vm(req: ProvisionRequest):
    return provision_worker.provision_worker(req)