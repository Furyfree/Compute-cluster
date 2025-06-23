"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // State til at holde brugernavn og kodeord
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Funktion der kaldes ved login
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // forhindrer siden i at reloade
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Login mislykkedes");
      }

      const data = await res.json();

      // Gem token og udløbstid i localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("expires_at", data.expires_at);

      // Automatisk logout når token udløber
      const msUntilExpiry =
        new Date(data.expires_at).getTime() - new Date().getTime();
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("expires_at");
        alert("Session udløbet. Log venligst ind igen.");
        router.push("/");
      }, msUntilExpiry);

      // Send brugeren til dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login fejl:", err);
      setError(err.message || "Login mislykkedes");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    // Du kan implementere sign up funktionalitet her
    // Eller sende brugeren til en separat sign up side
    router.push("/signup"); // Hvis I har en signup side
    // Eller vis en modal/form til oprettelse af bruger
  };

  return (
    // Hele skærmen, centreret både vandret og lodret, med lysegrå baggrund
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Login-boksen i midten: hvid baggrund, padding, afrundede hjørner, skygge, fast bredde */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        {/* Titel-afsnit */}
        <div className="mb-6 text-center">
          {/* Overskrift: stor tekst, fed, mørkegrå farve */}
          <h1 className="text-2xl font-bold text-gray-700">Login</h1>
        </div>

        {/* Formular med spacing mellem elementer */}
        <form className="space-y-4" onSubmit={handleSignIn}>
          {/* Username-felt */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-800"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="mt-1 w-full border rounded-md p-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password-felt */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="mt-1 w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Fejlbesked */}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Sign In-knap */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Logger ind..." : "Sign in"}
          </button>

          {/* Sign up-knap */}
          <button
            type="button"
            className="w-full bg-dtu-green-500 text-white py-2 rounded-md hover:bg-green-600"
            onClick={handleSignUp}
          >
            Sign up
          </button>
        </form>
      </div>
    </main>
  );
}
