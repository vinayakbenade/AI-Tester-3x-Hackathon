import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LogPilot — Log & Crash Triage",
  description: "AI-powered log analysis for QA engineers. Paste a log, get a diagnosis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
