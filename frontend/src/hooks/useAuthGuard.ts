"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, isTokenExpired, removeAuthToken } from "@/lib/api/auth";

export function useAuthGuard(redirectTo: string = "/login") {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push(redirectTo);
        return;
      }

      if (isTokenExpired()) {
        removeAuthToken();
        setIsAuthenticated(false);
        setIsLoading(false);
        alert("Session udløbet. Log venligst ind igen.");
        router.push(redirectTo);
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, redirectTo]);

  return { isAuthenticated, isLoading };
}

export function useRequireAuth(redirectTo: string = "/login") {
  const { isAuthenticated, isLoading } = useAuthGuard(redirectTo);

  if (isLoading) {
    return { isAuthenticated: null, isLoading: true };
  }

  if (!isAuthenticated) {
    return { isAuthenticated: false, isLoading: false };
  }

  return { isAuthenticated: true, isLoading: false };
}

// Hook til at checke admin rettigheder
export function useAdminGuard(redirectTo: string = "/dashboard") {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = getAuthToken();

      if (!token || isTokenExpired()) {
        setIsAdmin(false);
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        // Kald til /auth/me for at få bruger info
        const response = await fetch("http://127.0.0.1:8000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to get user info");
        }

        const userData = await response.json();
        const userIsAdmin = userData.is_admin || userData.group === "admin";

        setIsAdmin(userIsAdmin);

        if (!userIsAdmin) {
          router.push(redirectTo);
        }
      } catch (error) {
        console.error("Admin check error:", error);
        setIsAdmin(false);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [router, redirectTo]);

  return { isAdmin, isLoading };
}
