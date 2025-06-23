"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
};

type VM = {
  id: string;
  name: string;
  status: "running" | "stopped" | "suspended" | "failed";
  os: string;
  cpu: number;
  memory: number;
  disk: number;
  ip_address?: string;
  node: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [vms, setVMs] = useState<VM[]>([]);
  const [isLoadingVMs, setIsLoadingVMs] = useState(true);

  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const expiresAt = localStorage.getItem("expires_at");
    if (expiresAt) {
      const msUntilExpiry =
        new Date(expiresAt).getTime() - new Date().getTime();
      setTimeout(() => {
        alert("Session expired. Please log in again.");
        handleLogout();
      }, msUntilExpiry);
    }

    fetch("http://127.0.0.1:8000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/auth/login");
      });
  }, []);

  useEffect(() => {
    if (user) {
      fetchVMs();
    }
  }, [user]);

  const fetchVMs = async () => {
    setIsLoadingVMs(true);
    try {
      // Dette er en mockup - i virkeligheden ville du hente VM'er fra din backend
      // Implementer dit faktiske API-kald her
      const mockVMs: VM[] = [
        {
          id: "vm-001",
          name: "Ubuntu Server",
          status: "running",
          os: "Ubuntu 22.04",
          cpu: 2,
          memory: 4096,
          disk: 50,
          ip_address: "10.0.0.10",
          node: "node0",
        },
        {
          id: "vm-002",
          name: "Windows Server",
          status: "stopped",
          os: "Windows Server 2022",
          cpu: 4,
          memory: 8192,
          disk: 100,
          node: "node1",
        },
      ];

      // Simuler et API-kald
      setTimeout(() => {
        setVMs(mockVMs);
        setIsLoadingVMs(false);
      }, 500);
    } catch (error) {
      console.error("Failed to fetch VMs:", error);
      setIsLoadingVMs(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expires_at");
    router.push("/auth/login");
  };

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-dtu-white shadow rounded-lg p-6 border-t-4 border-dtu-red">
        <h1 className="text-2xl font-semibold text-gray-900">
          Velkommen, {user.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Her kan du administrere dine virtuelle maskiner og tilgå
          cluster-ressourcer.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-dtu-red rounded-md p-3">
                <svg
                  className="h-6 w-6 text-dtu-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">
                  Mine Virtuelle Maskiner
                </h3>
                <p className="text-sm text-gray-500">
                  {isLoadingVMs
                    ? "Indlæser..."
                    : `${vms.length} ${vms.length === 1 ? "VM" : "VMs"}`}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/dashboard/vms"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Se alle VMs →
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-dtu-green rounded-md p-3">
                <svg
                  className="h-6 w-6 text-dtu-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">
                  Remote Desktop
                </h3>
                <p className="text-sm text-gray-500">
                  Tilgå dine maskiner via browser
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/dashboard/remote"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Åbn Remote Desktop →
            </Link>
          </div>
        </div>

        {user.is_admin && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-dtu-navy rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-dtu-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                    />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    Proxmox Administration
                  </h3>
                  <p className="text-sm text-gray-500">
                    Administrer cluster infrastruktur
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                href="/dashboard/proxmox"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Åbn Proxmox →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Recent VMs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Seneste Virtuelle Maskiner
          </h2>
          <Link
            href="/dashboard/vms"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Se alle
          </Link>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          {isLoadingVMs ? (
            <div className="py-10 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-500">Indlæser virtuelle maskiner...</p>
            </div>
          ) : vms.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-500">
                Du har ingen virtuelle maskiner endnu.
              </p>
              <Link
                href="/dashboard/vms"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-dtu-white bg-dtu-red hover:bg-dtu-red-700"
              >
                Opret din første VM
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {vms.slice(0, 5).map((vm) => (
                <li key={vm.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`h-2.5 w-2.5 rounded-full mr-2 ${
                          vm.status === "running"
                            ? "bg-dtu-green"
                            : vm.status === "stopped"
                              ? "bg-dtu-red"
                              : vm.status === "suspended"
                                ? "bg-dtu-yellow"
                                : "bg-dtu-grey"
                        }`}
                      ></div>
                      <p className="text-sm font-medium text-dtu-red">
                        {vm.name}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/remote?vm=${vm.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-dtu-red bg-dtu-red-50 hover:bg-dtu-red-100"
                      >
                        Connect
                      </Link>
                      <Link
                        href={`/dashboard/vms/${vm.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {vm.os}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        CPU: {vm.cpu} cores
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                            clipRule="evenodd"
                          />
                        </svg>
                        RAM: {vm.memory} MB
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {vm.node}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {user.is_admin && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              Administration
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Admin-funktioner til systemet
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5">
            <Link
              href="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-dtu-white bg-dtu-red hover:bg-dtu-red-700"
            >
              Gå til Admin Panel
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
