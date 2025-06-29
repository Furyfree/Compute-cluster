from src.util.env import get_required_env
from src.util.ldap_sync_realm_httpx import sync_ldap_realm
from src.models.enums import SupportedOS, OS_TEMPLATE_MAP
import src.util.proxmox_util as proxmox_util
from src.models.models import ProvisionRequest, ProvisionResponse
from src.util.proxmox_util import migrate_vm_httpx
from fastapi import HTTPException
import src.services.proxmox_service as proxmox_service
import asyncio
import src.services.guac_service as guac_service


async def provision_worker(req: ProvisionRequest):
    if req.os not in SupportedOS:
        raise HTTPException(400, detail="Unsupported OS template requested")

    template_vmid = OS_TEMPLATE_MAP[req.os]
    template_node = proxmox_service.get_node_by_vmid(template_vmid)
    if not template_node:
        raise HTTPException(400, detail="Template VM not found")

    target_node = proxmox_service.pick_best_node()
    vmid = proxmox_service.get_next_vmid()
    name = f"{req.os.value.lower()}-{vmid}"

    clone_result = await proxmox_service.clone_vm(template_node, template_vmid, vmid, name)
    if "error" in clone_result:
        raise HTTPException(400, detail=clone_result["error"])

    await asyncio.sleep(160)


    provision_result = proxmox_service.provision_cloud_init_vm_with_retry(template_node, vmid, req)
    if "error" in provision_result:
        raise HTTPException(400, detail=provision_result["error"])

    await asyncio.sleep(5)


    start_result = proxmox_service.start_vm(template_node, vmid)
    if "error" in start_result:
        raise HTTPException(400, detail=start_result["error"])

    await asyncio.sleep(5)  # wait for VM to start

    if template_node != target_node:
        migrate_result = proxmox_service.migrate_vm(
            vmid=vmid,
            source_node=template_node,
            target_node=target_node,
        )
        if "error" in migrate_result:
            raise HTTPException(400, detail=migrate_result["error"])
        node_to_check = target_node
    else:
        print("Using same node for template and target, skipping migration")
        node_to_check = template_node

    ip = proxmox_service.wait_for_first_ip(node_to_check, vmid)
    if not ip:
        raise HTTPException(500, detail="Failed to retrieve IP address for the new VM")
    print(f"Provisioned VM {vmid} with IP {ip} on node {node_to_check}")
    guac_service.create_ssh_connection(
        name=name,
        hostname=ip,
        username=req.username,
        password=req.password,
        max_connections=2,
        max_connections_per_user=1
    )
    return ProvisionResponse(vmid=vmid, ip=ip, node=node_to_check)