"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getVMs,
  getContainers,
  getVMIP,
  getContainerIP,
  startVM,
  stopVM,
  restartVM,
  deleteVM,
  startContainer,
  stopContainer,
  restartContainer,
  deleteContainer,
  getNodePerformance,
  provisionVM,
} from "@/lib/api/proxmox";
import { VM, Container, NodePerformance, ProxmoxResource } from "@/types/proxmox";

// Hook for VM management
export function useVMs() {
  const [vms, setVMs] = useState<VM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVMs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVMs();
      setVMs(response.data || response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch VMs");
    } finally {
      setLoading(false);
    }
  }, []);

  const startVMAction = useCallback(async (node: string, vmId: number) => {
    try {
      await startVM(node, vmId);
      await fetchVMs(); // Refresh VM list
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchVMs]);

  const stopVMAction = useCallback(async (node: string, vmId: number) => {
    try {
      await stopVM(node, vmId);
      await fetchVMs(); // Refresh VM list
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchVMs]);

  const restartVMAction = useCallback(async (node: string, vmId: number) => {
    try {
      await restartVM(node, vmId);
      await fetchVMs(); // Refresh VM list
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchVMs]);

  const deleteVMAction = useCallback(async (node: string, vmId: number) => {
    try {
      await deleteVM(node, vmId);
      await fetchVMs(); // Refresh VM list
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchVMs]);

  useEffect(() => {
    fetchVMs();
  }, [fetchVMs]);

  return {
    vms,
    loading,
    error,
    refetch: fetchVMs,
    startVM: startVMAction,
    stopVM: stopVMAction,
    restartVM: restartVMAction,
    deleteVM: deleteVMAction,
  };
}

// Hook for Container management
export function useContainers() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getContainers();
      setContainers(response.data || response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch containers");
    } finally {
      setLoading(false);
    }
  }, []);

  const startContainerAction = useCallback(async (node: string, containerId: number) => {
    try {
      await startContainer(node, containerId);
      await fetchContainers(); // Refresh container list
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchContainers]);

  const stopContainerAction = useCallback(async (node: string, containerId: number) => {
    try {
      await stopContainer(node, containerId);
      await fetchContainers(); // Refresh container list
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchContainers]);

  const restartContainerAction = useCallback(async (node: string, containerId: number) => {
    try {
      await restartContainer(node, containerId);
      await fetchContainers(); // Refresh container list
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchContainers]);

  const deleteContainerAction = useCallback(async (node: string, containerId: number) => {
    try {
      await deleteContainer(node, containerId);
      await fetchContainers(); // Refresh container list
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchContainers]);

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  return {
    containers,
    loading,
    error,
    refetch: fetchContainers,
    startContainer: startContainerAction,
    stopContainer: stopContainerAction,
    restartContainer: restartContainerAction,
    deleteContainer: deleteContainerAction,
  };
}

// Hook for combined VM and Container resources
export function useProxmoxResources() {
  const { vms, loading: vmsLoading, error: vmsError } = useVMs();
  const { containers, loading: containersLoading, error: containersError } = useContainers();

  const allResources: ProxmoxResource[] = [
    ...vms.map(vm => ({
      vmid: vm.vmid,
      name: vm.name,
      node: vm.node,
      status: vm.status,
      type: "vm" as const,
    })),
    ...containers.map(container => ({
      vmid: container.vmid,
      name: container.name,
      node: container.node,
      status: container.status,
      type: "lxc" as const,
    })),
  ];

  const loading = vmsLoading || containersLoading;
  const error = vmsError || containersError;

  return {
    resources: allResources,
    vms,
    containers,
    loading,
    error,
  };
}

// Hook for getting VM/Container IP addresses
export function useResourceIP(node: string, vmid: number, type: "vm" | "lxc") {
  const [ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIP = useCallback(async () => {
    if (!node || !vmid) return;

    setLoading(true);
    setError(null);
    try {
      const response = type === "vm"
        ? await getVMIP(node, vmid)
        : await getContainerIP(node, vmid);

      setIp(response.ip || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch IP");
      setIp(null);
    } finally {
      setLoading(false);
    }
  }, [node, vmid, type]);

  useEffect(() => {
    fetchIP();
  }, [fetchIP]);

  return { ip, loading, error, refetch: fetchIP };
}

// Hook for node performance monitoring
export function useNodePerformance(node: string, refreshInterval: number = 30000) {
  const [performance, setPerformance] = useState<NodePerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    if (!node) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getNodePerformance(node);
      setPerformance(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch node performance");
    } finally {
      setLoading(false);
    }
  }, [node]);

  useEffect(() => {
    fetchPerformance();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchPerformance, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPerformance, refreshInterval]);

  return { performance, loading, error, refetch: fetchPerformance };
}

// Hook for VM provisioning
export function useVMProvisioning() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provisionNewVM = useCallback(async (
    node: string,
    payload: { user: string; password: string; os: string }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await provisionVM(node, payload);
      return { success: true, data: response };
    } catch (err: any) {
      setError(err.message || "Failed to provision VM");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    provisionVM: provisionNewVM,
    loading,
    error,
  };
}
