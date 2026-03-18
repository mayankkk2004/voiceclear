"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { register } from "@/lib/api";
import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password);
      // Auto-login after registration
      const token = await login(email, password);
      setToken(token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 animate-rise">
      <div className="rounded-2xl border border-white/40 bg-white/80 p-8 shadow-lg backdrop-blur-xl">
        <h1 className="mb-6 text-3xl font-bold text-ink">Create Account</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-ink/20 bg-white px-4 py-2 outline-none focus:border-sky"
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-ink/20 bg-white px-4 py-2 outline-none focus:border-sky"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-ink/20 bg-white px-4 py-2 outline-none focus:border-sky"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-sage px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-sky hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
