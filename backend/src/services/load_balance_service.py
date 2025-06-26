import time
import src.services.proxmox_service as proxmox_service
import src.util.proxmox_util as proxmox_util

def rebalance():
    metrics = proxmox_service.get_all_node_metrics()
    print("Current node metrics:")
    for node_name, node_metrics in metrics.items():
        print(f"Node {node_name}: CPU={node_metrics['CPU']:.2f}, MEMORY={node_metrics['Memory']:.2f}, IO_DELAY={node_metrics['IO_Delay']:.2f}")
    print("Rebalancing nodes based on current load...")
    for node_name, node_metrics in metrics.items():
        if proxmox_util.is_overloaded(node_metrics):
            print(f"[OVERLOAD] Node {node_name} exceeds threshold.")
            idle_target = proxmox_util.select_idle_target(metrics, exclude_node=node_name)
            if not idle_target:
                print(f"No idle node available to migrate VMs from {node_name}")
                continue
            vms = proxmox_service.get_running_vms_by_node(node_name)
            if not vms:
                continue
            vmid = vms[0]['vmid']
            print(f" → Migrating VM {vmid} from {node_name} → {idle_target}")
            result = proxmox_service.migrate_vm(vmid, node_name, idle_target)
            print(f"Migration result: {result}")
            break  # migrate one at a time