"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        router.push("/auth/login");
      }
    };

    verifyAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dtu-red"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <main className="py-6 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
      <footer className="bg-dtu-red text-dtu-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold">DTU Compute Cluster</h3>
              <p className="text-sm">Technical University of Denmark</p>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8">
              <Link
                href="https://www.dtu.dk"
                className="text-sm hover:underline"
              >
                DTU.dk
              </Link>
              <Link
                href="https://www.compute.dtu.dk"
                className="text-sm hover:underline"
              >
                DTU Compute
              </Link>
              <Link href="/help" className="text-sm hover:underline">
                Help & Support
              </Link>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dtu-red-400 text-sm text-center md:text-right">
            &copy; {new Date().getFullYear()} Technical University of Denmark.
            All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
