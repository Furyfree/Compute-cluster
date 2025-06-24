"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { useGuacamole } from "@/hooks/useGuacamole";
import { ProxmoxResource } from "@/types/proxmox";

interface RemoteDesktopProps {
  resource: ProxmoxResource | null;
  className?: string;
}

export default function RemoteDesktop({
  resource,
  className,
}: RemoteDesktopProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    connectionUrl,
    loading: guacamoleLoading,
    error: guacamoleError,
    openRemoteDesktop,
    isWindowOpen,
    closeConnection,
    focusConnection,
  } = useGuacamole(resource?.vmid, resource?.name);

  const handleDirectGuacamole = () => {
    window.open("http://compute-cluster-guacamole:8080/guacamole", "_blank");
  };

  const handleNewTab = () => {
    if (connectionUrl) {
      window.open(connectionUrl, "_blank", "noopener,noreferrer");
    }
  };

  const isResourceRunning = resource?.status === "running";

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
        ) : guacamoleLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-dtu-corporate-red mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Preparing connection to {resource.name}...
            </span>
          </div>
        ) : guacamoleError ? (
          <div className="space-y-4">
            <p className="text-red-600 dark:text-red-400 mb-4">
              ❌ Connection Error
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {guacamoleError}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="grey"
                onClick={handleDirectGuacamole}
                className="text-sm"
              >
                Open Guacamole Directly
              </Button>
              <Button
                variant="grey"
                onClick={() => window.location.reload()}
                className="text-sm"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        ) : connectionUrl ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Access remote desktop for <strong>{resource.name}</strong>
            </p>

            <div className="space-y-3">
              <Button
                variant="green"
                onClick={openRemoteDesktop}
                className="text-lg px-8 py-4"
              >
                {isWindowOpen ? "Open Another Window" : "Open Remote Desktop"}
              </Button>

              {isWindowOpen && (
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Remote desktop window is active
                </p>
              )}
            </div>

            {/* Advanced Options */}
            <div className="mt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {showAdvanced ? "▼" : "▶"} Advanced Options
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg space-y-3">
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button
                      variant="grey"
                      onClick={handleNewTab}
                      className="text-sm"
                    >
                      Open in New Tab
                    </Button>
                    <Button
                      variant="grey"
                      onClick={handleDirectGuacamole}
                      className="text-sm"
                    >
                      Guacamole Homepage
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-left">
                    <p className="mb-1">
                      <strong>Connection Details:</strong>
                    </p>
                    <p>
                      Resource: {resource.name} (ID: {resource.vmid})
                    </p>
                    <p>Node: {resource.node}</p>
                    <p>
                      Type:{" "}
                      {resource.type === "vm" ? "Virtual Machine" : "Container"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No remote desktop connection configured
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This resource doesnt have a remote desktop connection set up yet.
            </p>
            <Button
              variant="grey"
              onClick={handleDirectGuacamole}
              className="text-sm"
            >
              Access Guacamole Directly
            </Button>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-zinc-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Tip: Remote desktop opens in a popup window for better
            performance.
            <br />
            If blocked, please allow popups for this site.
          </p>
        </div>
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
