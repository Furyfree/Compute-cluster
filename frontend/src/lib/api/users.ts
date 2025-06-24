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

// User Management
export async function getAllUsers() {
  return authenticatedFetch("/users/list");
}

export async function getCurrentUserInfo() {
  return authenticatedFetch("/users/me");
}

export async function changeMyUsername(newUsername: string) {
  return authenticatedFetch("/users/me/change/username", {
    method: "PATCH",
    body: JSON.stringify({ new_username: newUsername }),
  });
}

export async function changeMyPassword(
  oldPassword: string,
  newPassword: string,
) {
  return authenticatedFetch("/users/me/change/password", {
    method: "PATCH",
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });
}

export async function deleteMyAccount() {
  return authenticatedFetch("/users/me/delete", {
    method: "DELETE",
  });
}

// Types
export interface User {
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  group?: string;
  is_admin?: boolean;
}

export interface ChangeUsernameRequest {
  new_username: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}
