import {
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  CreateUserResponse,
} from "@/types/auth";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function loginUser(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: credentials.username,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Login mislykkedes");
  }

  return response.json();
}

export async function createUser(
  userData: CreateUserRequest,
): Promise<CreateUserResponse> {
  const response = await fetch(`${API_BASE_URL}/users/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "User creation failed");
  }

  return response.json();
}

export function saveAuthToken(token: string, expiresAt: string): void {
  localStorage.setItem("token", token);
  localStorage.setItem("expires_at", expiresAt);
}

export function removeAuthToken(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("expires_at");
}

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

export function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem("expires_at");
  if (!expiresAt) return true;

  return new Date(expiresAt).getTime() <= new Date().getTime();
}

export async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to get current user");
  }

  return response.json();
}
