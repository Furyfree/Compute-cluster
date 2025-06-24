"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  loginUser,
  createUser,
  saveAuthToken,
  removeAuthToken,
} from "@/lib/api/auth";
import { LoginCredentials, SignupData } from "@/types/auth";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        removeAuthToken();
        alert("Session udløbet. Log venligst ind igen.");
        router.push("/login");
      }, msUntilExpiry);

      // Send brugeren til dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login fejl:", err);
      setError(err.message || "Login mislykkedes");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      router.push("/login");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "User creation failed");
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
}
