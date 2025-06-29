"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  VM,
  Container,
  NodePerformance,
  ProxmoxResource,
} from "@/types/proxmox";

// Hook for VM management
export function useVMs() {
  const [vms, setVMs] = useState<VM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVMs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVMs();
      setVMs(response.data || response);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch VMs";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const startVMAction = useCallback(
    async (node: string, vmId: number) => {
      try {
        await startVM(node, vmId);
        await fetchVMs(); // Refresh VM list
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to start VM";
        return { success: false, error: message };
      }
    },
    [fetchVMs],
  );

  const stopVMAction = useCallback(
    async (node: string, vmId: number) => {
      try {
        await stopVM(node, vmId);
        await fetchVMs(); // Refresh VM list
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to stop VM";
        return { success: false, error: message };
      }
    },
    [fetchVMs],
  );

  const restartVMAction = useCallback(
    async (node: string, vmId: number) => {
      try {
        await restartVM(node, vmId);
        await fetchVMs(); // Refresh VM list
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to restart VM";
        return { success: false, error: message };
      }
    },
    [fetchVMs],
  );

  const deleteVMAction = useCallback(
    async (node: string, vmId: number) => {
      try {
        await deleteVM(node, vmId);
        await fetchVMs(); // Refresh VM list
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to delete VM";
        return { success: false, error: message };
      }
    },
    [fetchVMs],
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getVMs();
        setVMs(response.data || response);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch VMs";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    vms,
    loading,
    error,
    refetch: () => fetchVMs(),
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

  const fetchContainers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getContainers();
      setContainers(response.data || response);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch containers";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const startContainerAction = useCallback(
    async (node: string, containerId: number) => {
      try {
        await startContainer(node, containerId);
        await fetchContainers(); // Refresh container list
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to start container";
        return { success: false, error: message };
      }
    },
    [fetchContainers],
  );

  const stopContainerAction = useCallback(
    async (node: string, containerId: number) => {
      try {
        await stopContainer(node, containerId);
        await fetchContainers(); // Refresh container list
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to stop container";
        return { success: false, error: message };
      }
    },
    [fetchContainers],
  );

  const restartContainerAction = useCallback(
    async (node: string, containerId: number) => {
      try {
        await restartContainer(node, containerId);
        await fetchContainers(); // Refresh container list
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to stop container";
        return { success: false, error: message };
      }
    },
    [fetchContainers],
  );

  const deleteContainerAction = useCallback(
    async (node: string, containerId: number) => {
      try {
        await deleteContainer(node, containerId);
        await fetchContainers(); // Refresh container list
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to delete container";
        return { success: false, error: message };
      }
    },
    [fetchContainers],
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getContainers();
        setContainers(response.data || response);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch containers";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    containers,
    loading,
    error,
    refetch: () => fetchContainers(),
    startContainer: startContainerAction,
    stopContainer: stopContainerAction,
    restartContainer: restartContainerAction,
    deleteContainer: deleteContainerAction,
  };
}

// Hook for combined VM and Container resources
export function useProxmoxResources() {
  const { vms, loading: vmsLoading, error: vmsError } = useVMs();
  const {
    containers,
    loading: containersLoading,
    error: containersError,
  } = useContainers();

  const allResources: ProxmoxResource[] = useMemo(
    () => [
      ...vms.map((vm) => ({
        vmid: vm.vmid,
        name: vm.name,
        node: vm.node,
        status: vm.status,
        type: "vm" as const,
      })),
      ...containers.map((container) => ({
        vmid: container.vmid,
        name: container.name,
        node: container.node,
        status: container.status,
        type: "lxc" as const,
      })),
    ],
    [vms, containers],
  );

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

  const isValidIP = (ipString: string): boolean => {
    // Check if it's an error message
    if (
      ipString.includes("Error") ||
      ipString.includes("500") ||
      ipString.includes("Internal Server Error") ||
      ipString.includes("No QEMU guest agent") ||
      ipString.includes("retrieving IP")
    ) {
      return false;
    }

    // Basic IP validation (IPv4)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipRegex.test(ipString);
  };

  useEffect(() => {
    const fetchIP = async () => {
      if (!node || !vmid) return;

      setLoading(true);
      setError(null);
      try {
        const rawResponse =
          type === "vm"
            ? await getVMIP(node, vmid)
            : await getContainerIP(node, vmid);

        const rawIp = await rawResponse;
        // Trim whitespace and remove quotes if present
        const processedIp = rawIp.trim().replace(/^"(.*)"$/, "$1");

        // Check if the response is a valid IP or an error message
        if (isValidIP(processedIp)) {
          setIp(processedIp);
        } else {
          setIp(null);
        }
      } catch (err: unknown) {
        setError("Failed to fetch IP");
        setIp(null);
      } finally {
        setLoading(false);
      }
    };

    fetchIP();
  }, [node, vmid, type]);

  const refetchIP = useCallback(async () => {
    if (!node || !vmid) return;

    setLoading(true);
    setError(null);
    try {
      const rawResponse =
        type === "vm"
          ? await getVMIP(node, vmid)
          : await getContainerIP(node, vmid);

      const rawIp = await rawResponse;
      // Trim whitespace and remove quotes if present
      const processedIp = rawIp.trim().replace(/^"(.*)"$/, "$1");

      // Check if the response is a valid IP or an error message
      if (isValidIP(processedIp)) {
        setIp(processedIp);
      } else {
        setIp(null);
      }
    } catch (err: unknown) {
      setError("Failed to fetch IP");
      setIp(null);
    } finally {
      setLoading(false);
    }
  }, [node, vmid, type]);

  return { ip, loading, error, refetch: refetchIP };
}

// Hook for node performance monitoring
export function useNodePerformance(
  node: string,
  refreshInterval: number = 30000,
) {
  const [performance, setPerformance] = useState<NodePerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!node) return;

      setLoading(true);
      setError(null);
      try {
        const response = await getNodePerformance(node);
        setPerformance(response);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch node performance");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchPerformance, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [node, refreshInterval]);

  const refetchPerformance = useCallback(async () => {
    if (!node) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getNodePerformance(node);
      setPerformance(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch node performance");
      }
    } finally {
      setLoading(false);
    }
  }, [node]);

  return { performance, loading, error, refetch: refetchPerformance };
}

// Hook for VM provisioning
export function useVMProvisioning() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provisionNewVM = useCallback(
    async (
      node: string,
      payload: { user: string; password: string; os: string },
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await provisionVM(node, payload);
        return { success: true, data: response };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to provision VM";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    provisionVM: provisionNewVM,
    loading,
    error,
  };
}
