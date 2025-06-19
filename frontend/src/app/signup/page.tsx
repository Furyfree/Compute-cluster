"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username: username,
          password: password,
          group: "test",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "User creation failed");
      }

      const data = await res.json();

      // Show success message
      alert(`User ${username} created successfully!`);

      // Clear form
      setFirstName("");
      setLastName("");
      setUsername("");
      setPassword("");

      // Redirect to login page so they can sign in with their new account
      router.push("/login");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "User creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white shadow-lg rounded-lg px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-gray-900 mb-2">Sign up</h1>
            <p className="text-gray-600 text-sm">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                required
                className="w-full px-0 py-3 text-gray-900 placeholder-gray-500 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
              />
            </div>

            <div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                required
                className="w-full px-0 py-3 text-gray-900 placeholder-gray-500 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
              />
            </div>

            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="w-full px-0 py-3 text-gray-900 placeholder-gray-500 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-0 py-3 text-gray-900 placeholder-gray-500 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md text-white font-medium text-base transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Creating..." : "Sign up"}
              </button>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center mt-4">
                {error}
              </div>
            )}
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
