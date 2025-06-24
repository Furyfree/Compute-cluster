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

// Server Status
export async function getServerStatus() {
  return fetch(`${API_BASE_URL}/`).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  });
}

export async function getHealthCheck() {
  return fetch(`${API_BASE_URL}/health`).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  });
}

// Types
export interface ServerStatusResponse {
  message: string;
  status: string;
}

export interface HealthCheckResponse {
  status: string;
}
