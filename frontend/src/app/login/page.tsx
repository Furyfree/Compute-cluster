"use client";

import Image from "next/image";
import { useState } from "react";
import { useLogin } from "@/hooks/useAuth";
import AuthCard from "@/components/AuthCard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { safeNavigate } from "@/lib/navigation";

export default function LoginPage() {
  const { login, loading, error } = useLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ username, password });
  };

  const handleSignUp = () => {
    safeNavigate("/signup");
  };

  return (
    <AuthCard title="Login" subtitle="Sign in to your account">
      <Image
        src="/images/DTU_Red.png"
        alt="DTU Logo"
        width={40}
        height={56}
        className="mx-auto h-16 mb-4"
      />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          type="text"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />

        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logger ind..." : "Sign in"}
        </Button>

        <Button
          type="button"
          variant="grey"
          className="w-full"
          onClick={handleSignUp}
        >
          Sign up
        </Button>
      </form>
    </AuthCard>
  );
}
