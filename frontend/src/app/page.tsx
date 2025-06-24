"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function LandingPage() {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push("/login");
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
        <Button
          variant="red"
          onClick={handleGoToLogin}
          className="text-lg px-8 py-4"
        >
          Go to login
        </Button>
      </div>
    </main>
  );
}
