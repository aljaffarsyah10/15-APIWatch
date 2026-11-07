import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 py-8 text-xs text-muted-foreground">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">APIWatch</span>
          <span>— Continuous API Monitoring Platform</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="hover:text-foreground transition-colors">
            Register
          </Link>
        </div>
        <div>
          <p>© 2026 APIWatch. Built according to PRD & Playbook specifications.</p>
        </div>
      </div>
    </footer>
  );
}
