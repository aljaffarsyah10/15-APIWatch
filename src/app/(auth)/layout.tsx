import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">APIWatch</span>
          </Link>
          <p className="text-xs text-muted-foreground font-mono">
            Continuous API Health & Latency Monitoring
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
