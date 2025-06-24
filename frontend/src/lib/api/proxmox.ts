import { getAuthToken } from "./auth";

const API_BASE_URL = "http://127.0.0.1:8000";

// Helper function to make authenticated requests
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// VM Management
export async function getVMs() {
  return authenticatedFetch("/proxmox/vms");
}

export async function getVMIP(node: string, vmId: number) {
  return authenticatedFetch(`/proxmox/vms/ip?node=${node}&vm_id=${vmId}`);
}

export async function startVM(node: string, vmId: number) {
  return authenticatedFetch(`/proxmox/vms/${node}/${vmId}/start`, {
    method: "POST",
  });
}

export async function stopVM(node: string, vmId: number) {
  return authenticatedFetch(`/proxmox/vms/${node}/${vmId}/stop`, {
    method: "POST",
  });
}

export async function restartVM(node: string, vmId: number) {
  return authenticatedFetch(`/proxmox/vms/${node}/${vmId}/restart`, {
    method: "POST",
  });
}

export async function deleteVM(node: string, vmId: number) {
  return authenticatedFetch(`/proxmox/vms/${node}/${vmId}/delete`, {
    method: "DELETE",
  });
}

// Container Management
export async function getContainers() {
  return authenticatedFetch("/proxmox/containers");
}

export async function getContainerIP(node: string, containerId: number) {
  return authenticatedFetch(
    `/proxmox/containers/ip?node=${node}&container_id=${containerId}`,
  );
}

export async function startContainer(node: string, containerId: number) {
  return authenticatedFetch(
    `/proxmox/containers/${node}/${containerId}/start`,
    {
      method: "POST",
    },
  );
}

export async function stopContainer(node: string, containerId: number) {
  return authenticatedFetch(`/proxmox/containers/${node}/${containerId}/stop`, {
    method: "POST",
  });
}

export async function restartContainer(node: string, containerId: number) {
  return authenticatedFetch(
    `/proxmox/containers/${node}/${containerId}/restart`,
    {
      method: "POST",
    },
  );
}

export async function deleteContainer(node: string, containerId: number) {
  return authenticatedFetch(
    `/proxmox/containers/${node}/${containerId}/delete`,
    {
      method: "DELETE",
    },
  );
}

// Node Management
export async function getNodeReport(node: string) {
  return authenticatedFetch(`/proxmox/nodes/${node}/report`);
}

export async function getNodePerformance(node: string) {
  return authenticatedFetch(`/proxmox/nodes/${node}/performance`);
}

export async function getNodePerformanceFull(node: string) {
  return authenticatedFetch(`/proxmox/nodes/${node}/performance/full`);
}

export async function getDiskHealth(node: string) {
  return authenticatedFetch(`/proxmox/nodes/${node}/disk/health`);
}

// Provisioning
export async function provisionVM(
  node: string,
  payload: {
    user: string;
    password: string;
    os: string;
  },
) {
  return authenticatedFetch(`/proxmox/nodes/${node}/provision`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Load Balancing
export async function loadBalanceNodes() {
  return authenticatedFetch("/proxmox/nodes/load-balance");
}

// Authentication Management
export async function syncLDAPToProxmox() {
  return authenticatedFetch("/proxmox/auth/sync", {
    method: "POST",
  });
}

export async function getAuthenticationRealms() {
  return authenticatedFetch("/proxmox/auth/realms");
}

export async function getProxmoxUsers() {
  return authenticatedFetch("/proxmox/auth/users/list");
}

export async function getProxmoxGroups() {
  return authenticatedFetch("/proxmox/auth/groups/list");
}

export async function getUserGroups(userid: string) {
  return authenticatedFetch(`/proxmox/auth/users/${userid}/groups`);
}
