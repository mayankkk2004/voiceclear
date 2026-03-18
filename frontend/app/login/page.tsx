"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = await login(email, password);
      setToken(token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 animate-rise">
      <div className="rounded-2xl border border-white/40 bg-white/80 p-8 shadow-lg backdrop-blur-xl">
        <h1 className="mb-6 text-3xl font-bold text-ink">Sign In</h1>

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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-ink/20 bg-white px-4 py-2 outline-none focus:border-sky"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-sky px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink/60">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-sky hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
