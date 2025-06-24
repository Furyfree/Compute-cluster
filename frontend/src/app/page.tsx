"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { safeNavigate } from "@/lib/navigation";

export default function LandingPage() {
  const router = useRouter();

  const handleGoToLogin = () => {
    console.log("[Landing] Go to login clicked");
    try {
      if (typeof window !== "undefined") {
        console.log("[Landing] Using direct navigation");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("[Landing] Navigation failed:", error);
    }
  };

  const testNavigation = () => {
    console.log("[Landing] Testing navigation methods");
    alert("Navigation test - check console for logs");

    // Test 1: Direct window.location
    console.log("Test 1: window.location.href");

    // Test 2: Delayed navigation
    setTimeout(() => {
      console.log("Test 2: Delayed navigation would execute now");
    }, 1000);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Blurred background image */}
      <div
        className="absolute inset-0 bg-center bg-cover z-0"
        style={{
          backgroundImage: 'url("/images/DTU-Line_of_light.jpg")',
          filter: "blur(8px)",
          transform: "scale(1.1)",
        }}
      />

      {/* Foreground content */}
      <div className="relative z-10 text-center space-y-6 max-w-2xl px-6 text-black dark:text-white">
        <h1 className="text-4xl font-bold text-dtu-corporate-red dark:text-dtu-navy-blue">
          Welcome to the DTU Compute Cluster
        </h1>
        <p className="text-lg text-dtu-grey dark:text-dtu-grey">
          Log in to access your virtual machines.
        </p>
        <div className="space-y-4">
          <Button
            variant="red"
            onClick={handleGoToLogin}
            className="text-lg px-8 py-4"
          >
            Go to login
          </Button>
          <Button
            variant="grey"
            onClick={testNavigation}
            className="text-sm px-4 py-2"
          >
            Test Navigation (Debug)
          </Button>
        </div>
      </div>
    </main>
  );
}
