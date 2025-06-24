"use client";

// Utility for reliable navigation in Next.js
export function navigateTo(path: string) {
  console.log(`[Navigation] Attempting to navigate to: ${path}`);

  // Direct navigation is more reliable in event handlers
  if (typeof window !== "undefined") {
    console.log(`[Navigation] Using window.location.href for: ${path}`);
    window.location.href = path;
  } else {
    console.warn("[Navigation] Window not available (server-side)");
  }
}

// Alternative navigation with delay for timing issues
export function navigateWithDelay(path: string, delay: number = 100) {
  console.log(`[Navigation] Delayed navigation to: ${path} (${delay}ms)`);

  if (typeof window !== "undefined") {
    setTimeout(() => {
      console.log(`[Navigation] Executing delayed navigation to: ${path}`);
      window.location.href = path;
    }, delay);
  }
}

// Force navigation that clears everything first
export function forceNavigate(path: string) {
  console.log(`[Navigation] Force navigating to: ${path}`);

  if (typeof window !== "undefined") {
    // Clear any pending operations
    window.setTimeout(() => {
      window.location.replace(path);
    }, 50);
  }
}

// Utility for logout with cleanup
export function performLogout() {
  console.log("[Auth] Performing logout...");

  if (typeof window !== "undefined") {
    // Clear any stored tokens
    localStorage.removeItem("token");
    localStorage.removeItem("expires_at");
    console.log("[Auth] Cleared tokens from localStorage");

    // Clear session storage
    sessionStorage.clear();
    console.log("[Auth] Cleared sessionStorage");

    // Navigate to login
    console.log("[Auth] Redirecting to login page");
    navigateTo("/login");
  } else {
    console.warn("[Auth] Cannot perform logout - window not available");
  }
}

// Utility for redirect after login
export function redirectAfterLogin(userRole?: string) {
  if (typeof window !== "undefined") {
    // Check if user is admin
    if (userRole === "admin") {
      navigateTo("/dashboard"); // Or admin dashboard if preferred
    } else {
      navigateTo("/dashboard");
    }
  }
}

// Safe navigation that checks if we're in the browser
export function safeNavigate(path: string, replace: boolean = false) {
  console.log(
    `[SafeNav] Attempting ${replace ? "replace" : "navigate"} to: ${path}`,
  );

  if (typeof window === "undefined") {
    console.warn("[SafeNav] Server-side navigation attempt ignored");
    return; // Server-side, do nothing
  }

  try {
    if (replace) {
      console.log(`[SafeNav] Using window.location.replace for: ${path}`);
      window.location.replace(path);
    } else {
      console.log(`[SafeNav] Using window.location.href for: ${path}`);
      window.location.href = path;
    }
  } catch (error) {
    console.error("[SafeNav] Navigation failed:", error);
  }
}

// Navigation with confirmation
export function navigateWithConfirmation(
  path: string,
  message: string = "Are you sure you want to leave this page?",
) {
  if (typeof window !== "undefined") {
    if (confirm(message)) {
      navigateTo(path);
    }
  }
}

// Back navigation
export function goBack() {
  if (typeof window !== "undefined") {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo("/dashboard"); // Fallback
    }
  }
}

// Open in new tab/window
export function openInNewTab(url: string) {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// Check if we can navigate (browser environment)
export function canNavigate(): boolean {
  return typeof window !== "undefined";
}
