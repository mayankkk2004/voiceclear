import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "VoiceScribe - Speech to Text",
  description: "Convert your voice into written text instantly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <div className="ambient-layer" />
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
