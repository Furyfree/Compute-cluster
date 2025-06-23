"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function LandingPage() {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-dtu-white dark:bg-black">
      <div className="text-center space-y-6 max-w-2xl px-6">
        <h1 className="text-4xl font-bold text-dtu-corporateRed dark:text-dtu-pink drop-shadow">
          Velkommen til DTU Compute Cluster
        </h1>
        <p className="text-lg text-dtu-grey dark:text-dtu-grey">
          Login for at få adgang til dine virtuelle maskiner.
        </p>
        <Button
          variant="primary"
          onClick={handleGoToLogin}
          className="text-lg px-8 py-4 shadow"
        >
          Gå til login
        </Button>
      </div>
    </main>
  );
}
