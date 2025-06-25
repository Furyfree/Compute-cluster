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

// Guacamole Management
export async function getGuacamoleToken() {
  return authenticatedFetch("/guacamole/token");
}

export async function getConnections() {
  return authenticatedFetch("/guacamole/connections");
}

export async function getConnection(connectionId: string) {
  return authenticatedFetch(`/guacamole/connections/${connectionId}`);
}

export async function getConnectionUrl(connectionId: string) {
  return authenticatedFetch(`/guacamole/connections/${connectionId}/url`);
}

export async function getConnectionUrlByName(name: string) {
  return authenticatedFetch(`/guacamole/connections/${name}/url`);
}

export async function createSSHConnection(
  connectionData: CreateSSHConnectionRequest,
) {
  return authenticatedFetch("/guacamole/connections/ssh", {
    method: "POST",
    body: JSON.stringify(connectionData),
  });
}

export async function createVNCConnection(
  connectionData: CreateVNCConnectionRequest,
) {
  return authenticatedFetch("/guacamole/connections/vnc", {
    method: "POST",
    body: JSON.stringify(connectionData),
  });
}

export async function createRDPConnection(
  connectionData: CreateRDPConnectionRequest,
) {
  return authenticatedFetch("/guacamole/connections/rdp", {
    method: "POST",
    body: JSON.stringify(connectionData),
  });
}

export async function deleteConnection(connectionId: string) {
  return authenticatedFetch(`/guacamole/connections/${connectionId}/delete`, {
    method: "DELETE",
  });
}

// Types
export interface GuacamoleToken {
  token: string;
  expires_at: string;
}

export interface GuacamoleConnection {
  id: string;
  name: string;
  protocol: "ssh" | "vnc" | "rdp";
  hostname: string;
  username?: string;
  max_connections: number;
  max_connections_per_user: number;
  active_connections?: number;
}

export interface CreateSSHConnectionRequest {
  name: string;
  hostname: string;
  username: string;
  password: string;
  max_connections?: number;
  max_connections_per_user?: number;
}

export interface CreateVNCConnectionRequest {
  name: string;
  hostname: string;
  password: string;
  max_connections?: number;
  max_connections_per_user?: number;
}

export interface CreateRDPConnectionRequest {
  name: string;
  hostname: string;
  username: string;
  password: string;
  max_connections?: number;
  max_connections_per_user?: number;
}

export interface ConnectionResponse {
  success: boolean;
  message: string;
  connection: GuacamoleConnection;
}

export interface ConnectionUrlResponse {
  url: string;
  token: string;
}
