"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type VM = {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'suspended' | 'failed';
  os: string;
  cpu: number;
  memory: number;
  disk: number;
  ip_address?: string;
  node: string;
};

export default function VMsPage() {
  const [vms, setVMs] = useState<VM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchVMs = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

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
          {
            id: "vm-003",
            name: "Debian Testing",
            status: "running",
            os: "Debian 12",
            cpu: 1,
            memory: 2048,
            disk: 30,
            ip_address: "10.0.0.11",
            node: "node2",
          },
        ];

        // Simuler et API-kald
        setTimeout(() => {
          setVMs(mockVMs);
          setIsLoading(false);
        }, 500);
      } catch (err) {
        console.error("Failed to fetch VMs:", err);
        setError("Der opstod en fejl ved hentning af virtuelle maskiner.");
        setIsLoading(false);
      }
    };

    fetchVMs();
  }, []);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'running':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Kører
          </span>
        );
      case 'stopped':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Stoppet
          </span>
        );
      case 'suspended':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Suspenderet
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-red-600">{error}</h2>
          <p className="mt-2 text-sm text-gray-500">
            Prøv at genindlæse siden eller kontakt administratoren.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
        <h1 className="text-lg font-medium text-gray-900">
          Mine Virtuelle Maskiner
        </h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          Opret ny VM
        </button>
      </div>

      {vms.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-lg font-medium text-gray-900">Ingen virtuelle maskiner fundet</h2>
          <p className="mt-2 text-sm text-gray-500">Du har ikke oprettet nogen virtuelle maskiner endnu.</p>
          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Opret din første VM
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Navn
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OS
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ressourcer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP-adresse
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Node
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vms.map((vm) => (
                <tr key={vm.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">{vm.name}</div>
                    <div className="text-xs text-gray-500">{vm.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vm.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vm.os}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>CPU: {vm.cpu} cores</div>
                    <div>RAM: {vm.memory} MB</div>
                    <div>Disk: {vm.disk} GB</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vm.ip_address || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vm.node}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/dashboard/remote?vm=${vm.id}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        Connect
                      </Link>
                      {vm.status === 'stopped' ? (
                        <button className="text-green-600 hover:text-green-900 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200">
                          Start
                        </button>
                      ) : vm.status === 'running' ? (
                        <button className="text-red-600 hover:text-red-900 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200">
                          Stop
                        </button>
                      ) : null}
                      <Link
                        href={`/dashboard/vms/${vm.id}`}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Detaljer
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
