import { getAuthToken } from "./auth";
import { getVMs } from "./proxmox";

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

// Admin User Management
export async function adminListAllUsers() {
  return authenticatedFetch("/admin/users/list");
}

export async function adminGetUserDetails(username: string) {
  return authenticatedFetch(`/admin/users/${username}`);
}

export async function adminCreateUser(userData: AdminCreateUserRequest) {
  return authenticatedFetch("/admin/users/create", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function adminChangeUsername(
  username: string,
  newUsername: string,
): Promise<AdminChangeUsernameResponse> {
  return authenticatedFetch(`/admin/${username}/change/username`, {
    method: "PATCH",
    body: JSON.stringify({ new_username: newUsername }),
  });
}

export async function adminChangeUserPassword(
  username: string,
  newPassword: string,
) {
  return authenticatedFetch(`/admin/${username}/change/password`, {
    method: "PATCH",
    body: JSON.stringify({ new_password: newPassword }),
  });
}

export async function adminChangeUserGroup(username: string, group: UserGroup) {
  return authenticatedFetch(`/admin/${username}/change/group`, {
    method: "PATCH",
    body: JSON.stringify({ group }),
  });
}

export async function adminDeleteUser(username: string) {
  return authenticatedFetch(`/admin/${username}/delete`, {
    method: "DELETE",
  });
}

// VM Management for Users
export async function adminGetUserVMs(username: string) {
  return authenticatedFetch(`/admin/users/${username}/vms`);
}

export async function adminGrantVMAccess(vmid: number, username: string) {
  return authenticatedFetch(`/admin/vms/${vmid}/grant`, {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export async function adminRevokeVMAccess(vmid: number, username: string) {
  return authenticatedFetch(`/admin/vms/${vmid}/revoke?username=${username}`, {
    method: "DELETE",
  });
}

export async function adminGetAllVMs() {
  const response = await getVMs();
  // Backend returns array directly, so we use it as-is
  return response;
}

// VM Provisioning
export async function getOSTemplates() {
  return authenticatedFetch("/proxmox/os-templates");
}

export async function provisionVM(provisionData: ProvisionVMRequest) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  // Use longer timeout for VM provisioning (5 minutes)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

  try {
    const response = await fetch(`${API_BASE_URL}/proxmox/provision`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(provisionData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(
        "VM provisioning timed out. Please check the VM status manually.",
      );
    }
    throw error;
  }
}

// Admin-only VM/Container deletion with longer timeout
export async function adminDeleteVM(node: string, vmid: number) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  // Use longer timeout for VM deletion (3 minutes)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000);

  try {
    const response = await fetch(
      `${API_BASE_URL}/proxmox/vms/${node}/${vmid}/delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(
        "VM deletion timed out. The action may still be processing in the background.",
      );
    }
    throw error;
  }
}

export async function adminDeleteContainer(node: string, containerId: number) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  // Use longer timeout for container deletion (3 minutes)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000);

  try {
    const response = await fetch(
      `${API_BASE_URL}/proxmox/containers/${node}/${containerId}/delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(
        "Container deletion timed out. The action may still be processing in the background.",
      );
    }
    throw error;
  }
}

// Types
export interface AdminCreateUserRequest {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  group: UserGroup;
}

export type UserGroup = "test" | "admin" | "user";

export interface AdminUser {
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  group: UserGroup;
  is_admin: boolean;
  created_at?: string;
  last_login?: string;
}

export interface AdminUserListResponse {
  success: boolean;
  users: AdminUser[];
  total_count: number;
}

export interface AdminUserDetailsResponse {
  success: boolean;
  user: AdminUser;
}

export interface AdminUserVMsResponse {
  success: boolean;
  username: string;
  vms: VM[];
}

export interface VM {
  vmid: number;
  name: string;
  node: string;
  status: "running" | "stopped" | "paused";
}

export interface VMAccessResponse {
  success: boolean;
  message: string;
}

export interface AdminChangeUsernameResponse {
  success: boolean;
  message: string;
  requires_logout: boolean;
}

export interface OSTemplate {
  value: string;
  label: string;
}

export interface OSTemplatesResponse {
  templates: OSTemplate[];
}

export interface ProvisionVMRequest {
  username: string;
  password: string;
  ssh_key: string;
  os: string;
}

export interface ProvisionVMResponse {
  vmid: number;
  ip: string | null;
  node: string;
}
