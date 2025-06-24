"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getGuacamoleToken,
  getConnections,
  getConnectionUrl,
  GuacamoleConnection,
} from "@/lib/api/guacamole";

// Hook for managing Guacamole connections
export function useGuacamoleConnections() {
  const [connections, setConnections] = useState<GuacamoleConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getConnections();
        setConnections(response.connections || response);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch connections";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const refetchConnections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getConnections();
      setConnections(response.connections || response);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch connections";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    connections,
    loading,
    error,
    refetch: refetchConnections,
  };
}

// Hook for getting connection URL for a specific resource
export function useGuacamoleConnection(vmId?: number, vmName?: string) {
  const [connectionUrl, setConnectionUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getConnectionForResource = async () => {
      if (!vmId && !vmName) {
        setConnectionUrl("");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // First, get all connections
        const connectionsResponse = await getConnections();
        const connections =
          connectionsResponse.connections || connectionsResponse;

        // Find a connection that matches this VM (by name or ID)
        let targetConnection = null;
        if (connections && Array.isArray(connections)) {
          targetConnection = connections.find((conn: GuacamoleConnection) =>
            vmName
              ? conn.name.toLowerCase().includes(vmName.toLowerCase())
              : false,
          );
        }

        if (targetConnection) {
          // Get the connection URL
          const urlResponse = await getConnectionUrl(targetConnection.id);
          setConnectionUrl(urlResponse.url || "");
        } else {
          // Fallback: use default connection or construct generic URL
          try {
            const token = await getGuacamoleToken();
            const baseUrl = "http://compute-cluster-guacamole:8080/guacamole";
            setConnectionUrl(`${baseUrl}/#/?token=${token.token}`);
          } catch (tokenErr) {
            // Ultimate fallback
            setConnectionUrl("http://compute-cluster-guacamole:8080/guacamole");
          }
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to get connection URL";
        setError(message);
        setConnectionUrl("http://compute-cluster-guacamole:8080/guacamole");
      } finally {
        setLoading(false);
      }
    };

    getConnectionForResource();
  }, [vmId, vmName]);

  const refetchConnection = useCallback(async () => {
    if (!vmId && !vmName) {
      setConnectionUrl("");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // First, get all connections
      const connectionsResponse = await getConnections();
      const connections =
        connectionsResponse.connections || connectionsResponse;

      // Find a connection that matches this VM (by name or ID)
      let targetConnection = null;
      if (connections && Array.isArray(connections)) {
        targetConnection = connections.find((conn: GuacamoleConnection) =>
          vmName
            ? conn.name.toLowerCase().includes(vmName.toLowerCase())
            : false,
        );
      }

      if (targetConnection) {
        // Get the connection URL
        const urlResponse = await getConnectionUrl(targetConnection.id);
        setConnectionUrl(urlResponse.url || "");
      } else {
        // Fallback: use default connection or construct generic URL
        try {
          const token = await getGuacamoleToken();
          const baseUrl = "http://compute-cluster-guacamole:8080/guacamole";
          setConnectionUrl(`${baseUrl}/#/?token=${token.token}`);
        } catch (tokenErr) {
          // Ultimate fallback
          setConnectionUrl("http://compute-cluster-guacamole:8080/guacamole");
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to get connection URL";
      setError(message);
      setConnectionUrl("http://compute-cluster-guacamole:8080/guacamole");
    } finally {
      setLoading(false);
    }
  }, [vmId, vmName]);

  return {
    connectionUrl,
    loading,
    error,
    refetch: refetchConnection,
  };
}

// Hook for opening Guacamole connection in new window
export function useGuacamoleWindow() {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [windowRef, setWindowRef] = useState<Window | null>(null);

  const openConnection = useCallback((url: string, windowName?: string) => {
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
      url,
      windowName || "guacamole_connection",
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

      // Clean up interval after 1 hour (in case window check fails)
      setTimeout(() => {
        clearInterval(checkClosed);
      }, 3600000);

      return newWindow;
    } else {
      // Popup blocked or failed to open
      throw new Error(
        "Failed to open connection window. Please check popup blocker settings.",
      );
    }
  }, []);

  const closeConnection = useCallback(() => {
    if (windowRef && !windowRef.closed) {
      windowRef.close();
      setIsWindowOpen(false);
      setWindowRef(null);
    }
  }, [windowRef]);

  const focusConnection = useCallback(() => {
    if (windowRef && !windowRef.closed) {
      windowRef.focus();
    }
  }, [windowRef]);

  return {
    isWindowOpen,
    openConnection,
    closeConnection,
    focusConnection,
  };
}

// Combined hook for complete Guacamole integration
export function useGuacamole(vmId?: number, vmName?: string) {
  const { connectionUrl, loading, error } = useGuacamoleConnection(
    vmId,
    vmName,
  );
  const { openConnection, closeConnection, focusConnection, isWindowOpen } =
    useGuacamoleWindow();

  const openRemoteDesktop = useCallback(() => {
    if (connectionUrl) {
      try {
        openConnection(
          connectionUrl,
          `guac_${vmId}_${vmName?.replace(/\s+/g, "_")}`,
        );
      } catch (err: unknown) {
        console.error(
          "Failed to open remote desktop:",
          err instanceof Error ? err.message : err,
        );
        // Fallback: try to open in same tab
        window.open(connectionUrl, "_blank", "noopener,noreferrer");
      }
    }
  }, [connectionUrl, openConnection, vmId, vmName]);

  return {
    connectionUrl,
    loading,
    error,
    isWindowOpen,
    openRemoteDesktop,
    closeConnection,
    focusConnection,
  };
}
