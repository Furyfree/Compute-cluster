"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/Button";

const mockVMs = [
  {
    id: "vm1",
    name: "Virtuel Maskine XX",
    ip: "192.168.1.100",
    status: "running",
    memory: "4 GB",
    cpu: "2 vCPU",
    disk: "40 GB",
  },
  {
    id: "vm2",
    name: "Virtuel Maskine YY",
    ip: "192.168.1.101",
    status: "stopped",
    memory: "8 GB",
    cpu: "4 vCPU",
    disk: "100 GB",
  },
];

export default function DashboardPage() {
  const [selectedVMId, setSelectedVMId] = useState("vm1");
  const selectedVM = mockVMs.find((vm) => vm.id === selectedVMId)!;

  return (
    <div className="min-h-screen bg-dtu-white dark:bg-dtu-black text-dtu-black dark:text-dtu-white">
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-dtu-grey dark:border-zinc-800">
        <Image
          src="/images/DTU_Red.png"
          alt="DTU Logo"
          width={25}
          height={15}
        />
        <div className="bg-dtu-grey dark:bg-zinc-800 px-4 py-2 rounded text-sm">
          User ▾
        </div>
      </header>

      {/* Main layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-dtu-grey dark:border-zinc-800 p-4 space-y-2 bg-dtu-grey/20 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold mb-2">Dine maskiner</h2>
          {mockVMs.map((vm) => (
            <button
              key={vm.id}
              onClick={() => setSelectedVMId(vm.id)}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                selectedVMId === vm.id
                  ? "bg-dtu-blue text-white"
                  : "hover:bg-dtu-blue/10"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{vm.name}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    vm.status === "running" ? "bg-dtu-green" : "bg-dtu-red"
                  }`}
                />
              </div>
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Guacamole */}
          <div className="flex-1 min-h-[300px] h-full bg-black rounded overflow-hidden border border-dtu-grey dark:border-zinc-700">
            <iframe
              src={`http://localhost:8001/guacamole/#/client/1?token=DD7EA02DAEBFADD9E6E0C2FBEC778C2EFDAE2A7BD2FB6858D160CB07F35ACB97`}
              title="Guacamole"
              className="w-full h-full border-none"
            />
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              💡 <strong>IP:</strong> {selectedVM.ip}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <span
                className={
                  selectedVM.status === "running"
                    ? "text-dtu-green"
                    : "text-dtu-red"
                }
              >
                {selectedVM.status}
              </span>
            </div>
            <div>
              <strong>RAM:</strong> {selectedVM.memory}
            </div>
            <div>
              <strong>CPU:</strong> {selectedVM.cpu}
            </div>
            <div>
              <strong>Disk:</strong> {selectedVM.disk}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 pt-2">
            <Button variant="red">Stop</Button>
            <Button variant="orange">Reboot</Button>
            <Button variant="green">Start</Button>
          </div>
        </main>
      </div>
    </div>
  );
}
