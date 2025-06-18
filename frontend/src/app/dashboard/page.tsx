"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const expiresAt = localStorage.getItem("expires_at");
    if (expiresAt) {
      const msUntilExpiry =
        new Date(expiresAt).getTime() - new Date().getTime();
      setTimeout(() => {
        alert("Session expired. Please log in again.");
        handleLogout();
      }, msUntilExpiry);
    }

    fetch("http://127.0.0.1:8000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/auth/login");
      });
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("http://127.0.0.1:8000/admin/users/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      setUsers(data);
    } else {
      console.error("Unexpected user data:", data);
    }
  };

  useEffect(() => {
    if (user?.is_admin) {
      fetchUsers();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expires_at");
    router.push("/auth/login");
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8000/admin/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newUser),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "Failed to create user");
      return;
    }

    alert(`✅ Created ${data.email}`);
    await fetchUsers();
    setNewUser({ name: "", email: "", password: "" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;

    const res = await fetch(`http://127.0.0.1:8000/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== id));
    } else {
      const err = await res.json();
      alert(err.detail || "Delete failed");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const res = await fetch(
      `http://127.0.0.1:8000/admin/users/${editingUser.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          is_admin: editingUser.is_admin,
        }),
      },
    );

    const updated = await res.json();
    if (!res.ok) return alert(updated.detail || "Failed to update user");

    setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
    setEditingUser(null);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Admin: {user.is_admin ? " Yes" : " No"}</p>

      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Logout
      </button>

      {user.is_admin && (
        <>
          <hr style={{ margin: "2rem 0" }} />
          <h2>Add a New User</h2>
          <form
            onSubmit={handleCreateUser}
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <input
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
            />
            <button type="submit">Create User</button>
          </form>

          <hr style={{ margin: "2rem 0" }} />
          <h2>All Users</h2>

          {Array.isArray(users) &&
            users.map((u) =>
              editingUser?.id === u.id ? (
                <form
                  onSubmit={handleEditSubmit}
                  key={u.id}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <input
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                  />
                  <input
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                  />
                  <label>
                    Admin:
                    <input
                      type="checkbox"
                      checked={editingUser.is_admin}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          is_admin: e.target.checked,
                        })
                      }
                    />
                  </label>
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditingUser(null)}>
                    Cancel
                  </button>
                </form>
              ) : (
                <div key={u.id} style={{ marginBottom: "0.5rem" }}>
                  <strong>{u.name}</strong> — {u.email} —{" "}
                  {u.is_admin ? "Admin" : "User"}
                  <button
                    onClick={() => setEditingUser(u)}
                    style={{ marginLeft: "1rem" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    style={{ marginLeft: "0.5rem", color: "red" }}
                  >
                    Delete
                  </button>
                </div>
              ),
            )}
        </>
      )}
    </div>
  );
}
