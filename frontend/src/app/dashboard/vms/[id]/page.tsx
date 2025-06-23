"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface VMDetailPageProps {
  params: {
    id: string;
  };
}

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
  created_at: string;
  last_accessed?: string;
};

type VMMetrics = {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_in: number;
  network_out: number;
  uptime: number;
};

export default function VMDetailPage({ params }: VMDetailPageProps) {
  const { id } = params;
  const [vm, setVM] = useState<VM | null>(null);
  const [metrics, setMetrics] = useState<VMMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch VM data
    // Mock data for demonstration
    const mockVM: VM = {
      id,
      name: id === 'vm-001' ? 'Ubuntu Server' : 'Windows Server',
      status: id === 'vm-001' ? 'running' : 'stopped',
      os: id === 'vm-001' ? 'Ubuntu 22.04' : 'Windows Server 2022',
      cpu: id === 'vm-001' ? 2 : 4,
      memory: id === 'vm-001' ? 4096 : 8192,
      disk: id === 'vm-001' ? 50 : 100,
      ip_address: id === 'vm-001' ? '10.0.0.10' : undefined,
      node: id === 'vm-001' ? 'node0' : 'node1',
      created_at: '2023-05-15T10:00:00Z',
      last_accessed: id === 'vm-001' ? '2023-06-20T14:30:00Z' : undefined,
    };

    const mockMetrics: VMMetrics = {
      cpu_usage: 35,
      memory_usage: 42,
      disk_usage: 28,
      network_in: 1024 * 1024 * 15, // 15 MB
      network_out: 1024 * 1024 * 5, // 5 MB
      uptime: 86400 * 3, // 3 days
    };

    // Simulate API call delay
    setTimeout(() => {
      setVM(mockVM);
      setMetrics(mockMetrics);
      setIsLoading(false);
    }, 800);
  }, [id, router]);

  const handleVMAction = (action: string) => {
    if (!vm) return;

    setVM({
      ...vm,
      status: action === 'start' ? 'running' :
              action === 'stop' ? 'stopped' :
              action === 'restart' ? 'running' : vm.status
    });

    // Here you would make an API call to perform the action
    alert(`${action.charAt(0).toUpperCase() + action.slice(1)}ing VM ${vm.id}...`);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dtu-red"></div>
      </div>
    );
  }

  if (error || !vm) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-dtu-red">
            {error || 'VM ikke fundet'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Den anmodede virtuelle maskine kunne ikke findes.
          </p>
          <Link
            href="/dashboard/vms"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dtu-red hover:bg-dtu-red-700"
          >
            Tilbage til VM oversigt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className={`h-3 w-3 rounded-full mr-2 ${
              vm.status === 'running' ? 'bg-dtu-green' :
              vm.status === 'stopped' ? 'bg-dtu-red' :
              vm.status === 'suspended' ? 'bg-dtu-yellow' : 'bg-gray-500'
            }`}></div>
            <h1 className="text-lg font-medium text-gray-900">{vm.name}</h1>
            <span className="ml-4 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {vm.id}
            </span>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/dashboard/remote?vm=${vm.id}`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dtu-green hover:bg-dtu-green-700"
            >
              Connect
            </Link>
            {vm.status === 'stopped' ? (
              <button
                onClick={() => handleVMAction('start')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dtu-red hover:bg-dtu-red-700"
              >
                Start
              </button>
            ) : vm.status === 'running' ? (
              <>
                <button
                  onClick={() => handleVMAction('restart')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dtu-orange hover:bg-orange-600"
                >
                  Restart
                </button>
                <button
                  onClick={() => handleVMAction('stop')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dtu-red hover:bg-dtu-red-700"
                >
                  Stop
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* VM details and metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* VM details card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg leading-6 font-medium text-gray-900">VM Detaljer</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Operativsystem</dt>
                <dd className="mt-1 text-sm text-gray-900">{vm.os}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vm.status === 'running' ? 'bg-green-100 text-green-800' :
                    vm.status === 'stopped' ? 'bg-red-100 text-red-800' :
                    vm.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {vm.status === 'running' ? 'Kører' :
                     vm.status === 'stopped' ? 'Stoppet' :
                     vm.status === 'suspended' ? 'Suspenderet' :
                     vm.status}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">CPU</dt>
                <dd className="mt-1 text-sm text-gray-900">{vm.cpu} cores</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Memory</dt>
                <dd className="mt-1 text-sm text-gray-900">{vm.memory} MB</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Disk</dt>
                <dd className="mt-1 text-sm text-gray-900">{vm.disk} GB</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">IP Adresse</dt>
                <dd className="mt-1 text-sm text-gray-900">{vm.ip_address || 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Node</dt>
                <dd className="mt-1 text-sm text-gray-900">{vm.node}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Oprettet</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(vm.created_at).toLocaleDateString('da-DK')}
                </dd>
              </div>
              {vm.last_accessed && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Sidst adganget</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(vm.last_accessed).toLocaleString('da-DK')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* VM metrics card */}
        {metrics && vm.status === 'running' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Ressource Forbrug</h2>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">CPU Forbrug</dt>
                  <dd className="mt-1">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-dtu-red h-2.5 rounded-full" style={{ width: `${metrics.cpu_usage}%` }}></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-900">{metrics.cpu_usage}%</span>
                    </div>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Memory Forbrug</dt>
                  <dd className="mt-1">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-dtu-blue h-2.5 rounded-full" style={{ width: `${metrics.memory_usage}%` }}></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-900">{metrics.memory_usage}%</span>
                    </div>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Disk Forbrug</dt>
                  <dd className="mt-1">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-dtu-green h-2.5 rounded-full" style={{ width: `${metrics.disk_usage}%` }}></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-900">{metrics.disk_usage}%</span>
                    </div>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Uptime</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatUptime(metrics.uptime)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Network In</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatBytes(metrics.network_in)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Network Out</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatBytes(metrics.network_out)}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>

      {/* Advanced options card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Avancerede Indstillinger</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Tag Snapshot
            </button>
            <button className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Rediger Konfiguration
            </button>
            <button className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Migrer VM
            </button>
            <button className="inline-flex justify-center items-center px-4 py-2 border border-dtu-red text-sm font-medium rounded-md text-dtu-red bg-white hover:bg-red-50">
              Slet VM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
