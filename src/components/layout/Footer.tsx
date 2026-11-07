import React from "react";
import Link from "next/link";
import { Activity, Radio } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-background py-8 text-xs text-muted-foreground">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-foreground">APIWatch</span>
          <span className="text-muted-foreground/80">— Production API Health Telemetry</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/status" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Radio className="h-3 w-3 text-emerald-500" />
            <span>Public Status</span>
          </Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="hover:text-foreground transition-colors">
            Get Started
          </Link>
        </div>
        <div>
          <p>© 2026 APIWatch. Enterprise API Reliability.</p>
        </div>
      </div>
    </footer>
  );
}
