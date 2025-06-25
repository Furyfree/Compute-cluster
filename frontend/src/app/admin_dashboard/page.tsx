"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useAdminGuard } from "@/hooks/useAuthGuard";
import {
  adminListAllUsers,
  adminGetUserDetails,
  adminCreateUser,
  adminChangeUsername,
  adminChangeUserPassword,
  adminChangeUserGroup,
  adminDeleteUser,
  adminGetUserVMs,
  adminGrantVMAccess,
  adminRevokeVMAccess,
  adminGetAllVMs,
  AdminUser,
  UserGroup,
  AdminCreateUserRequest,
  VM,
  AdminUserVMsResponse,
} from "@/lib/api/admin";
import { removeAuthToken } from "@/lib/api/auth";
import { forceNavigate } from "@/lib/navigation";
import { getCurrentUserInfo } from "@/lib/api/users";
import ChangeUsernameModal from "@/components/modals/ChangeUsernameModal";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";
import { performLogout } from "@/lib/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, isLoading: adminLoading } = useAdminGuard();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "create">("users");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showChangeUsernameModal, setShowChangeUsernameModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // VM management state
  const [userVMs, setUserVMs] = useState<VM[]>([]);
  const [allVMs, setAllVMs] = useState<VM[]>([]);
  const [vmLoading, setVmLoading] = useState(false);
  const [showAddVMModal, setShowAddVMModal] = useState(false);

  // Create user form state
  const [createForm, setCreateForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    group: "user" as UserGroup,
  });

  // Edit user form state
  const [editForm, setEditForm] = useState({
    username: "",
    password: "",
    group: "user" as UserGroup,
  });

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminListAllUsers();
      setUsers(response.users || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection
  const handleUserSelect = async (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      password: "",
      group: user.group,
    });

    // Fetch detailed user info
    try {
      const response = await adminGetUserDetails(user.username);
      setSelectedUser(response.user);
    } catch (err: any) {
      console.error("Failed to fetch user details:", err);
    }

    // Fetch user's VMs
    await fetchUserVMs(user.username);
  };

  // Fetch user's VMs
  const fetchUserVMs = async (username: string) => {
    setVmLoading(true);
    try {
      const response = await adminGetUserVMs(username);
      setUserVMs(response.vms || []);
    } catch (err: any) {
      console.error("Failed to fetch user VMs:", err);
      setUserVMs([]);
    } finally {
      setVmLoading(false);
    }
  };

  // Fetch all VMs for adding access
  const fetchAllVMs = async () => {
    try {
      console.log("Fetching all VMs...");
      const response = await adminGetAllVMs();
      console.log("All VMs response:", response);
      // Backend returns array directly
      setAllVMs(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error("Failed to fetch all VMs:", err);
      alert(`Failed to fetch VMs: ${err.message}`);
      setAllVMs([]);
    }
  };

  // Handle grant VM access
  const handleGrantVMAccess = async (vmid: number) => {
    if (!selectedUser) return;

    try {
      await adminGrantVMAccess(vmid, selectedUser.username);
      await fetchUserVMs(selectedUser.username);
      setShowAddVMModal(false);
      alert("VM access granted successfully!");
    } catch (err: any) {
      alert(`Failed to grant VM access: ${err.message}`);
    }
  };

  // Handle revoke VM access
  const handleRevokeVMAccess = async (vmid: number) => {
    if (!selectedUser) return;

    if (!confirm(`Are you sure you want to revoke access to VM ${vmid}?`)) {
      return;
    }

    try {
      await adminRevokeVMAccess(vmid, selectedUser.username);
      await fetchUserVMs(selectedUser.username);
      alert("VM access revoked successfully!");
    } catch (err: any) {
      alert(`Failed to revoke VM access: ${err.message}`);
    }
  };

  // Handle show add VM modal
  const handleShowAddVMModal = () => {
    setShowAddVMModal(true);
    fetchAllVMs();
  };

  // Handle create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await adminCreateUser(createForm);
      setCreateForm({
        first_name: "",
        last_name: "",
        username: "",
        password: "",
        group: "user",
      });
      setActiveTab("users");
      await fetchUsers();
      alert("User created successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // Handle update username
  const handleUpdateUsername = async () => {
    if (!selectedUser || !editForm.username) return;

    try {
      const result = await adminChangeUsername(
        selectedUser.username,
        editForm.username,
      );
      await fetchUsers();
      setSelectedUser({ ...selectedUser, username: editForm.username });

      // Check if admin changed their own username
      if (result.requires_logout) {
        alert(
          "Username updated successfully! You will be logged out for security reasons.",
        );
        setTimeout(() => {
          performLogout();
        }, 2000);
      } else {
        alert("Username updated successfully!");
      }
    } catch (err: any) {
      alert(`Failed to update username: ${err.message}`);
    }
  };

  // Handle update password
  const handleUpdatePassword = async () => {
    if (!selectedUser || !editForm.password) return;

    try {
      await adminChangeUserPassword(selectedUser.username, editForm.password);
      setEditForm({ ...editForm, password: "" });
      alert("Password updated successfully!");
    } catch (err: any) {
      alert(`Failed to update password: ${err.message}`);
    }
  };

  // Handle update group
  const handleUpdateGroup = async () => {
    if (!selectedUser) return;

    try {
      await adminChangeUserGroup(selectedUser.username, editForm.group);
      await fetchUsers();
      setSelectedUser({ ...selectedUser, group: editForm.group });
      alert("User group updated successfully!");
    } catch (err: any) {
      alert(`Failed to update group: ${err.message}`);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    if (
      !confirm(
        `Are you sure you want to delete user "${selectedUser.username}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await adminDeleteUser(selectedUser.username);
      await fetchUsers();
      setSelectedUser(null);
      alert("User deleted successfully!");
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const handleLogout = () => {
    console.log("[Admin] Logout button clicked");
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("expires_at");
      sessionStorage.clear();
      forceNavigate("/login");
    }
  };

  const handleGoToDashboard = () => {
    console.log("[Admin] Dashboard button clicked");
    forceNavigate("/dashboard");
  };

  const handleUsernameChanged = (newUsername: string) => {
    setCurrentUser((prev: any) => ({ ...prev, username: newUsername }));
  };

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

    if (isAdmin) {
      fetchUserInfo();
    }
  }, [isAdmin]);

  // Fetch users on component mount
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Show loading screen while checking admin privileges
  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dtu-white dark:bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dtu-corporate-red mx-auto mb-4"></div>
          <p className="text-dtu-black dark:text-dtu-white">
            Checking admin privileges...
          </p>
        </div>
      </div>
    );
  }

  // Don't render anything if not admin (useAdminGuard will redirect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dtu-white dark:bg-zinc-900 text-dtu-black dark:text-dtu-white">
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-dtu-grey dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <Image
            src="/images/DTU_Red.png"
            alt="DTU Logo"
            width={25}
            height={15}
          />
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="grey"
            onClick={handleGoToDashboard}
            className="text-sm"
          >
            Back to Dashboard
          </Button>
          <div className="relative group">
            <div className="bg-dtu-grey dark:bg-zinc-800 px-4 py-2 rounded text-sm cursor-pointer">
              {currentUser?.username || "Admin"} ▾
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => setShowChangeUsernameModal(true)}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 w-full text-left"
                >
                  Change Username
                </button>
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 w-full text-left"
                >
                  Change Password
                </button>
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

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-80 border-r border-dtu-grey dark:border-zinc-800 p-4 bg-dtu-grey/20 dark:bg-zinc-900">
          {/* Tab Navigation */}
          <div className="flex mb-4 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-white dark:bg-zinc-700 text-dtu-black dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-dtu-black dark:hover:text-white"
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "create"
                  ? "bg-white dark:bg-zinc-700 text-dtu-black dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-dtu-black dark:hover:text-white"
              }`}
            >
              Create User
            </button>
          </div>

          {activeTab === "users" ? (
            <>
              <h2 className="text-lg font-semibold mb-4">All Users</h2>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-dtu-corporate-red"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  {error}
                </div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.username}
                      onClick={() => handleUserSelect(user)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedUser?.username === user.username
                          ? "bg-dtu-blue text-white border-dtu-blue"
                          : "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm opacity-75">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-xs opacity-60 mt-1">
                            Group: {user.group}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.is_admin
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {user.is_admin ? "Admin" : "User"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Create New User</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <Input
                  type="text"
                  label="First Name"
                  value={createForm.first_name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, first_name: e.target.value })
                  }
                  required
                />
                <Input
                  type="text"
                  label="Last Name"
                  value={createForm.last_name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, last_name: e.target.value })
                  }
                  required
                />
                <Input
                  type="text"
                  label="Username"
                  value={createForm.username}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, username: e.target.value })
                  }
                  required
                />
                <Input
                  type="password"
                  label="Password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  required
                />
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Group
                  </label>
                  <select
                    value={createForm.group}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        group: e.target.value as UserGroup,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-dtu-black dark:text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="test">Test</option>
                  </select>
                </div>
                {error && (
                  <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create User"}
                </Button>
              </form>
            </>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 min-h-0 overflow-y-auto">
          {selectedUser ? (
            <div className="max-w-2xl">
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">User Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Username
                    </label>
                    <p className="text-lg font-medium">
                      {selectedUser.username}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Full Name
                    </label>
                    <p className="text-lg">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Group
                    </label>
                    <p className="text-lg">{selectedUser.group}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Admin Status
                    </label>
                    <p className="text-lg">
                      {selectedUser.is_admin ? "Admin" : "Regular User"}
                    </p>
                  </div>
                </div>
              </div>

              {/* VM Management Section */}
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">
                    VM Access Management
                  </h3>
                  <Button onClick={handleShowAddVMModal} variant="blue">
                    Add VM Access
                  </Button>
                </div>

                {vmLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-dtu-corporate-red"></div>
                  </div>
                ) : userVMs.length > 0 ? (
                  <div className="space-y-3">
                    {userVMs.map((vm) => (
                      <div
                        key={vm.vmid}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-medium">
                                VM {vm.vmid} - {vm.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Node: {vm.node} | Status: {vm.status}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                vm.status === "running"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : vm.status === "stopped"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              }`}
                            >
                              {vm.status}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="red"
                          size="sm"
                          onClick={() => handleRevokeVMAccess(vm.vmid)}
                        >
                          Remove Access
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No VM access granted to this user</p>
                  </div>
                )}
              </div>

              {/* Edit User Form */}
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Edit User</h3>
                <div className="space-y-6">
                  {/* Change Username */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Change Username
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({ ...editForm, username: e.target.value })
                        }
                        placeholder="New username"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleUpdateUsername}
                        disabled={editForm.username === selectedUser.username}
                      >
                        Update
                      </Button>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Change Password
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        value={editForm.password}
                        onChange={(e) =>
                          setEditForm({ ...editForm, password: e.target.value })
                        }
                        placeholder="New password"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleUpdatePassword}
                        disabled={!editForm.password}
                      >
                        Update
                      </Button>
                    </div>
                  </div>

                  {/* Change Group */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Change Group
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={editForm.group}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            group: e.target.value as UserGroup,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-dtu-black dark:text-white"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="test">Test</option>
                      </select>
                      <Button
                        onClick={handleUpdateGroup}
                        disabled={editForm.group === selectedUser.group}
                      >
                        Update
                      </Button>
                    </div>
                  </div>

                  {/* Delete User */}
                  <div className="pt-4 border-t border-gray-200 dark:border-zinc-700">
                    <h4 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                      Danger Zone
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Once you delete a user, there is no going back. Please be
                      certain.
                    </p>
                    <Button variant="red" onClick={handleDeleteUser}>
                      Delete User
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No user selected</p>
                <p className="text-sm">
                  Select a user from the sidebar to view and edit their details
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add VM Access Modal */}
      {showAddVMModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Add VM Access</h3>
              <button
                onClick={() => setShowAddVMModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select VMs to grant access to {selectedUser?.username}
            </p>

            {allVMs.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allVMs
                  .filter(
                    (vm) => !userVMs.some((userVm) => userVm.vmid === vm.vmid),
                  )
                  .map((vm) => (
                    <div
                      key={vm.vmid}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-medium">
                              VM {vm.vmid} - {vm.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Node: {vm.node} | Status: {vm.status}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              vm.status === "running"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : vm.status === "stopped"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            }`}
                          >
                            {vm.status}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="blue"
                        size="sm"
                        onClick={() => handleGrantVMAccess(vm.vmid)}
                      >
                        Grant Access
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Loading VMs...</p>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button variant="grey" onClick={() => setShowAddVMModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ChangeUsernameModal
        isOpen={showChangeUsernameModal}
        onClose={() => setShowChangeUsernameModal(false)}
        currentUsername={currentUser?.username || ""}
        onUsernameChanged={handleUsernameChanged}
      />
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}
