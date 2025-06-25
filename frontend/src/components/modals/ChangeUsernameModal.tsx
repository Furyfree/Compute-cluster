"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { changeMyUsername } from "@/lib/api/users";
import { performLogout } from "@/lib/navigation";

interface ChangeUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  onUsernameChanged: (newUsername: string) => void;
}

export default function ChangeUsernameModal({
  isOpen,
  onClose,
  currentUsername,
  onUsernameChanged,
}: ChangeUsernameModalProps) {
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUsername.trim()) {
      setError("Username cannot be empty");
      return;
    }

    if (newUsername === currentUsername) {
      setError("New username must be different from current username");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await changeMyUsername(newUsername);
      onUsernameChanged(newUsername);
      setNewUsername("");

      alert(
        "Username changed successfully! You will be logged out for security reasons.",
      );

      // Force logout immediately after username change to refresh the JWT token
      setTimeout(() => {
        performLogout();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to change username");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNewUsername("");
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4 text-dtu-black dark:text-dtu-white">
          Change Username
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dtu-black dark:text-dtu-white mb-1">
              Current Username
            </label>
            <input
              type="text"
              value={currentUsername}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dtu-black dark:text-dtu-white mb-1">
              New Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-dtu-black dark:text-dtu-white focus:ring-2 focus:ring-dtu-blue focus:border-transparent disabled:opacity-50"
              placeholder="Enter new username"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="grey"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="blue"
              disabled={loading || !newUsername.trim()}
              className="flex-1"
            >
              {loading ? "Changing..." : "Change Username"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
