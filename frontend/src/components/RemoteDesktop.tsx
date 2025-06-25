"use client";

import { useState, useEffect } from "react";
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
  const [connectionUrl, setConnectionUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [windowRef, setWindowRef] = useState<Window | null>(null);

  const isResourceRunning = resource?.status === "running";

  // Fetch console URL when resource changes
  useEffect(() => {
    const fetchConsoleUrl = async () => {
      if (!resource || !isResourceRunning) {
        setConnectionUrl("");
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Fetching console for VM:", resource.name);

        const token = getAuthToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        const consoleUrl = `http://127.0.0.1:8000/nodes/vms/console/${resource.name}`;
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
        setConnectionUrl(finalUrl);
      } catch (err: any) {
        setError(err.message || "Failed to get console URL");
        setConnectionUrl("");
      } finally {
        setLoading(false);
      }
    };

    fetchConsoleUrl();
  }, [resource, isResourceRunning]);

  const openConnection = () => {
    if (!connectionUrl) return;

    const windowFeatures = [
      "width=1200",
      "height=800",
      "left=100",
      "top=100",
      "resizable=yes",
      "scrollbars=yes",
      "status=yes",
      "menubar=no",
      "toolbar=no",
      "location=no",
    ].join(",");

    const newWindow = window.open(
      connectionUrl,
      `connection_${resource?.name?.replace(/\s+/g, "_")}`,
      windowFeatures,
    );

    if (newWindow) {
      setWindowRef(newWindow);
      setIsWindowOpen(true);

      // Monitor if window is closed
      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          setIsWindowOpen(false);
          setWindowRef(null);
          clearInterval(checkClosed);
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(checkClosed);
      }, 3600000);
    }
  };

  const closeConnection = () => {
    if (windowRef && !windowRef.closed) {
      windowRef.close();
      setIsWindowOpen(false);
      setWindowRef(null);
    }
  };

  const focusConnection = () => {
    if (windowRef && !windowRef.closed) {
      windowRef.focus();
    }
  };

  return (
    <div
      className={`bg-white dark:bg-zinc-800 rounded-lg p-6 border border-dtu-grey dark:border-zinc-700 ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Remote Desktop Access</h3>
        {isWindowOpen && (
          <div className="flex gap-2">
            <Button
              variant="grey"
              onClick={focusConnection}
              className="text-sm"
              title="Bring remote desktop window to front"
            >
              Focus
            </Button>
            <Button
              variant="red"
              onClick={closeConnection}
              className="text-sm"
              title="Close remote desktop window"
            >
              Close
            </Button>
          </div>
        )}
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
        ) : !isResourceRunning ? (
          <div>
            <p className="text-yellow-600 dark:text-yellow-400 mb-4">
              {resource.name} is currently {resource.status}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The machine must be running to access remote desktop
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start the machine first, then try connecting
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-dtu-corporate-red mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Preparing connection to {resource.name}...
            </span>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-red-600 dark:text-red-400 mb-4">
              ❌ Connection Error
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {error}
            </p>
          </div>
        ) : connectionUrl ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Remote desktop ready for <strong>{resource.name}</strong>
            </p>

            <div className="space-y-3">
              <Button
                variant="green"
                onClick={openConnection}
                className="text-lg px-8 py-4"
              >
                {isWindowOpen ? "Open Another Connection" : "Open Connection"}
              </Button>

              {isWindowOpen && (
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Connection window is active
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No remote desktop connection available
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This resource doesn't have a remote desktop connection configured.
            </p>
          </div>
        )}

        {connectionUrl && (
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-zinc-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Remote desktop opens in a popup window. Please allow popups if
              blocked.
            </p>
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
