import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background relative selection:bg-blue-500/20 selection:text-blue-500">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm ring-1 ring-blue-500/30 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">APIWatch</span>
          </Link>
          <p className="text-xs text-muted-foreground font-mono">
            High-Reliability API Monitoring Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
