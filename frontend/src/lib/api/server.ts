const API_BASE_URL = "http://127.0.0.1:8000";

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
