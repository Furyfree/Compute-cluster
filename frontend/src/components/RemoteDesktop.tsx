"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { getAuthToken } from "@/lib/api/auth";
import { ProxmoxResource } from "@/types/proxmox";

interface RemoteDesktopProps {
  resource: ProxmoxResource | null;
  className?: string;
}

export default function RemoteDesktop({
  resource,
  className,
}: RemoteDesktopProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isResourceRunning = resource?.status === "running";

  const openConnection = async () => {
    if (!resource) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching console for VM:", resource.name);

      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const consoleUrl = `http://127.0.0.1:8000/proxmox/nodes/vms/console/${resource.name}`;
      console.log("Console API URL:", consoleUrl);

      const response = await fetch(consoleUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Console API response:", responseData);

      // Handle error response from backend
      if (responseData.error) {
        console.error("Backend error:", responseData.error);
        throw new Error(responseData.error);
      }

      // If response is just a URL string, use it directly
      const finalUrl =
        typeof responseData === "string"
          ? responseData
          : responseData.url || responseData;

      console.log("Final console URL:", finalUrl);

      // Open URL in new tab
      window.open(finalUrl, "_blank");
    } catch (err: any) {
      setError(err.message || "Failed to get console URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-zinc-800 rounded-lg p-6 border border-dtu-grey dark:border-zinc-700 ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Remote Desktop Access</h3>
      </div>

      <div className="text-center py-8">
        <div className="text-6xl mb-4"></div>

        {!resource ? (
          <div className="text-gray-500 dark:text-gray-400">
            <p className="mb-2">No resource selected</p>
            <p className="text-sm">
              Select a VM or container to access remote desktop
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Remote desktop for <strong>{resource.name}</strong>
            </p>

            <div className="space-y-3">
              <Button
                variant="green"
                onClick={openConnection}
                disabled={loading}
                className="text-lg px-8 py-4"
              >
                {loading ? "Opening Console..." : "Open Remote Desktop"}
              </Button>

              {!isResourceRunning && (
                <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                  {resource.name} is currently {resource.status}
                </p>
              )}

              {error && (
                <p className="text-red-600 dark:text-red-400 text-sm">
                  ❌ {error}
                </p>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-zinc-600">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Remote desktop opens in a new tab. Please allow popups if
                blocked.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Additional helper component for connection status
export function RemoteDesktopStatus({
  isConnected,
  resourceName,
}: {
  isConnected: boolean;
  resourceName?: string;
}) {
  if (!isConnected) return null;

  return (
    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span>Connected to {resourceName}</span>
    </div>
  );
}
