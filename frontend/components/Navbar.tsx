"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearToken, isAuthenticated } from "@/lib/auth";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const authed = isAuthenticated();

  const navClass = (href: string) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition ${
      pathname === href ? "bg-ink text-paper shadow-sm" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
    }`;

  return (
    <header className="mx-auto mb-8 mt-4 flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/40 bg-white/75 px-4 py-3 shadow-lg backdrop-blur-xl animate-rise">
      <Link href="/" className="text-lg font-bold tracking-tight text-ink sm:text-xl"
        style={{ fontFamily: "'Syne', system-ui, sans-serif" }}>
        VoiceScribe
      </Link>

      <nav className="flex items-center gap-2">
        <Link href="/" className={navClass("/")}>
          Recorder
        </Link>
        <Link href="/history" className={navClass("/history")}>
          History
        </Link>
        {!authed ? (
          <>
            <Link href="/login" className={navClass("/login")}>
              Login
            </Link>
            <Link href="/register" className={navClass("/register")}>
              Register
            </Link>
          </>
        ) : (
          <button
            onClick={() => {
              clearToken();
              router.push("/login");
            }}
            className="rounded-full bg-coral px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}
