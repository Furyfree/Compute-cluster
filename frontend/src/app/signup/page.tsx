"use client";

import Image from "next/image";
import { useState } from "react";
import { useSignup } from "@/hooks/useAuth";
import AuthCard from "@/components/AuthCard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { safeNavigate } from "@/lib/navigation";

export default function SignupPage() {
  const { signup, loading, error } = useSignup();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup({
      firstName,
      lastName,
      username,
      password,
    });
  };

  const handleBackToLogin = () => {
    safeNavigate("/login");
  };

  return (
    <AuthCard
      title="Sign up"
      subtitle="Create your account"
      className="max-w-md"
    >
      <Image src="/images/DTU_Red.png" alt="DTU Logo" width={40} height={56} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          variant="underline"
          required
        />

        <Input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          variant="underline"
          required
        />

        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          variant="underline"
          required
        />

        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          variant="underline"
          required
        />

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <div className="pt-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Sign up"}
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={handleBackToLogin}
          className="text-dtu-blue dark:text-dtu-yellow hover:text-dtu-navyBlue dark:hover:text-dtu-orange font-medium text-sm transition-colors"
        >
          Already have an account? Sign in
        </button>
      </div>
    </AuthCard>
  );
}
