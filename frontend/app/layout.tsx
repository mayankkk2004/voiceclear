import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const headingFont = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});

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
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>
        <div className="app-shell">
          <div className="ambient-layer" />
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
