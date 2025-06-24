from proxmoxer import ProxmoxAPI
from src.util.env import get_required_env
from src.util.ldap_sync_realm_httpx import sync_ldap_realm
from src.models.enums import SupportedOS, OS_TEMPLATE_MAP
import src.util.proxmox_util as proxmox_util
import time
from src.models.models import ProvisionRequest, ProvisionResponse
from src.util.proxmox_util import migrate_vm_httpx
from fastapi import HTTPException, Depends
from pydantic import BaseModel
import src.services.proxmox_service as proxmox_service


def provision_worker(req: ProvisionRequest):
    if req.os not in SupportedOS:
        raise HTTPException(400, detail="Unsupported OS template requested")
    template_vmid = SupportedOS[req.os]
    template_node = "pve-template"
    target_node = proxmox_service.pick_best_node()
    if template_node == target_node:
        raise HTTPException(400, detail="Template and target node must differ")
    vmid = proxmox_service.get_next_vmid()
    name = f"{req.os.value.lower()}-{vmid}"

    clone_result = proxmox_service.clone_vm(template_node, template_vmid, target_node, vmid, name)
    if "error" in clone_result:
        raise HTTPException(400, detail=clone_result["error"])

    provision_result = proxmox_service.cloud_init_vm(template_node, vmid, req)
    if "error" in provision_result:
        raise HTTPException(400, detail=provision_result["error"])

    start_result = proxmox_service.start_vm(target_node, vmid)
    if "error" in start_result:
        raise HTTPException(400, detail=start_result["error"])

    migrate_result = proxmox_service.migrate_vm(
        vmid=vmid,
        source_node=target_node,
        target_node=target_node,
    )

    ip = proxmox_service.wait_for_first_ip(target_node, vmid)

    return ProvisionResponse(vmid=vmid, ip=ip, node=target_node)