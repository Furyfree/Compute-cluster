"use client";

import { useState } from "react";
import { loginUser, createUser, saveAuthToken } from "@/lib/api/auth";
import { LoginCredentials, SignupData } from "@/types/auth";
import { safeNavigate, performLogout } from "@/lib/navigation";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    setLoading(true);

    try {
      const data = await loginUser(credentials);

      // Gem token og udløbstid
      saveAuthToken(data.access_token, data.expires_at);

      // Automatisk logout når token udløber
      const msUntilExpiry =
        new Date(data.expires_at).getTime() - new Date().getTime();
      setTimeout(() => {
        alert("Session udløbet. Log venligst ind igen.");
        performLogout();
      }, msUntilExpiry);

      // Send brugeren til dashboard
      safeNavigate("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login mislykkedes";
      console.error("Login fejl:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (userData: SignupData) => {
    setError(null);
    setLoading(true);

    try {
      await createUser({
        first_name: userData.firstName,
        last_name: userData.lastName,
        username: userData.username,
        password: userData.password,
        group: "user",
      });

      alert(`User ${userData.username} created successfully!`);
      // Redirect to login page after successful signup
      safeNavigate("/login");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "User creation failed";
      console.error("Signup error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
}
