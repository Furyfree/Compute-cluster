"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useRequireAuth } from "@/hooks/useAuthGuard";
import { useProxmoxResources, useResourceIP } from "@/hooks/useProxmox";
import { getCurrentUserInfo } from "@/lib/api/users";
import { removeAuthToken } from "@/lib/api/auth";
import { ProxmoxResource } from "@/types/proxmox";
import RemoteDesktop from "@/components/RemoteDesktop";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const {
    resources,
    vms,
    containers,
    loading: resourcesLoading,
    error,
  } = useProxmoxResources();

  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(
    null,
  );
  const [selectedResource, setSelectedResource] =
    useState<ProxmoxResource | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Get IP for selected resource
  const { ip, loading: ipLoading } = useResourceIP(
    selectedResource?.node || "",
    selectedResource?.vmid || 0,
    selectedResource?.type || "vm",
  );

  // Set initial selected resource
  useEffect(() => {
    if (resources.length > 0 && !selectedResourceId) {
      const firstResource = resources[0];
      setSelectedResourceId(firstResource.vmid);
      setSelectedResource(firstResource);
    }
  }, [resources, selectedResourceId]);

  // Update selected resource when ID changes
  useEffect(() => {
    if (selectedResourceId) {
      const resource = resources.find((r) => r.vmid === selectedResourceId);
      setSelectedResource(resource || null);
    }
  }, [selectedResourceId, resources]);

  // Fetch current user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getCurrentUserInfo();
        setCurrentUser(userInfo.user || userInfo);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    if (isAuthenticated) {
      fetchUserInfo();
    }
  }, [isAuthenticated]);

  const handleResourceAction = async (action: string) => {
    if (!selectedResource) return;

    setActionLoading(action);
    try {
      const {
        startVM,
        stopVM,
        restartVM,
        deleteVM,
        startContainer,
        stopContainer,
        restartContainer,
        deleteContainer,
      } = await import("@/lib/api/proxmox");

      let result;
      if (selectedResource.type === "vm") {
        switch (action) {
          case "start":
            result = await startVM(
              selectedResource.node,
              selectedResource.vmid,
            );
            break;
          case "stop":
            result = await stopVM(selectedResource.node, selectedResource.vmid);
            break;
          case "restart":
            result = await restartVM(
              selectedResource.node,
              selectedResource.vmid,
            );
            break;
          case "delete":
            if (
              confirm(
                `Are you sure you want to delete ${selectedResource.name}?`,
              )
            ) {
              result = await deleteVM(
                selectedResource.node,
                selectedResource.vmid,
              );
            }
            break;
        }
      } else {
        switch (action) {
          case "start":
            result = await startContainer(
              selectedResource.node,
              selectedResource.vmid,
            );
            break;
          case "stop":
            result = await stopContainer(
              selectedResource.node,
              selectedResource.vmid,
            );
            break;
          case "restart":
            result = await restartContainer(
              selectedResource.node,
              selectedResource.vmid,
            );
            break;
          case "delete":
            if (
              confirm(
                `Are you sure you want to delete ${selectedResource.name}?`,
              )
            ) {
              result = await deleteContainer(
                selectedResource.node,
                selectedResource.vmid,
              );
            }
            break;
        }
      }

      if (result) {
        alert(`${action} completed successfully`);
        // Refresh the page to get updated data
        window.location.reload();
      }
    } catch (err: any) {
      alert(`Failed to ${action} resource: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  const handleGoToAdmin = () => {
    router.push("/admin_dashboard");
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dtu-white dark:bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dtu-corporate-red mx-auto mb-4"></div>
          <p className="text-dtu-black dark:text-dtu-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (useRequireAuth will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dtu-white dark:bg-zinc-900 text-dtu-black dark:text-dtu-white">
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-dtu-grey dark:border-zinc-800">
        <Image
          src="/images/DTU_Red.png"
          alt="DTU Logo"
          width={25}
          height={15}
        />
        <div className="flex items-center gap-4">
          {currentUser?.is_admin && (
            <Button
              variant="grey"
              onClick={handleGoToAdmin}
              className="text-sm"
            >
              Admin Panel
            </Button>
          )}
          <div className="relative group">
            <div className="bg-dtu-grey dark:bg-zinc-800 px-4 py-2 rounded text-sm cursor-pointer">
              {currentUser?.username || "User"} ▾
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 w-full text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-dtu-grey dark:border-zinc-800 p-4 space-y-2 bg-dtu-grey/20 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold mb-2">Your Resources</h2>

          {resourcesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-dtu-corporate-red"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
              {error}
            </div>
          ) : resources.length === 0 ? (
            <div className="text-gray-500 text-sm p-2">No resources found</div>
          ) : (
            resources.map((resource) => (
              <button
                key={`${resource.type}-${resource.vmid}`}
                onClick={() => setSelectedResourceId(resource.vmid)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  selectedResourceId === resource.vmid
                    ? "bg-dtu-blue text-white"
                    : "hover:bg-dtu-blue/10"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{resource.name}</span>
                    <div className="text-xs opacity-75">
                      {resource.type === "vm" ? "VM" : "Container"} •{" "}
                      {resource.node}
                    </div>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      resource.status === "running"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>
              </button>
            ))
          )}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {selectedResource ? (
            <>
              {/* Remote Desktop Access */}
              <RemoteDesktop resource={selectedResource} />

              {/* Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>ID:</strong> {selectedResource.vmid}
                </div>
                <div>
                  <strong>Type:</strong>{" "}
                  {selectedResource.type === "vm"
                    ? "Virtual Machine"
                    : "Container"}
                </div>
                <div>
                  <strong>Node:</strong> {selectedResource.node}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      selectedResource.status === "running"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {selectedResource.status}
                  </span>
                </div>
                <div>
                  <strong>IP:</strong> {ipLoading ? "Loading..." : ip || "N/A"}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4 pt-2">
                <Button
                  variant="red"
                  onClick={() => handleResourceAction("stop")}
                  disabled={
                    actionLoading === "stop" ||
                    selectedResource.status !== "running"
                  }
                >
                  {actionLoading === "stop" ? "Stopping..." : "Stop"}
                </Button>
                <Button
                  variant="orange"
                  onClick={() => handleResourceAction("restart")}
                  disabled={
                    actionLoading === "restart" ||
                    selectedResource.status !== "running"
                  }
                >
                  {actionLoading === "restart" ? "Restarting..." : "Restart"}
                </Button>
                <Button
                  variant="green"
                  onClick={() => handleResourceAction("start")}
                  disabled={
                    actionLoading === "start" ||
                    selectedResource.status === "running"
                  }
                >
                  {actionLoading === "start" ? "Starting..." : "Start"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No resource selected</p>
                <p className="text-sm">
                  Select a resource from the sidebar to manage it
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
