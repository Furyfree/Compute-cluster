"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { changeMyPassword } from "@/lib/api/users";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword.trim()) {
      setError("Current password is required");
      return;
    }

    if (!newPassword.trim()) {
      setError("New password is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword === oldPassword) {
      setError("New password must be different from current password");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await changeMyPassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
      alert("Password changed successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4 text-dtu-black dark:text-dtu-white">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dtu-black dark:text-dtu-white mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-dtu-black dark:text-dtu-white focus:ring-2 focus:ring-dtu-blue focus:border-transparent disabled:opacity-50"
              placeholder="Enter current password"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dtu-black dark:text-dtu-white mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-dtu-black dark:text-dtu-white focus:ring-2 focus:ring-dtu-blue focus:border-transparent disabled:opacity-50"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dtu-black dark:text-dtu-white mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-dtu-black dark:text-dtu-white focus:ring-2 focus:ring-dtu-blue focus:border-transparent disabled:opacity-50"
              placeholder="Confirm new password"
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
              disabled={loading || !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
              className="flex-1"
            >
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
