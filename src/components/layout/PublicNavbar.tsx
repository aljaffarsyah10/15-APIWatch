import React from "react";
import Link from "next/link";
import { Activity, ArrowRight, Radio } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm ring-1 ring-blue-500/30 group-hover:scale-105 transition-transform">
            <Activity className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">APIWatch</span>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
            PRO
          </span>
        </Link>
        
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/status"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-medium gap-1 text-muted-foreground hover:text-foreground hidden sm:inline-flex")}
          >
            <Radio className="h-3 w-3 text-emerald-500" />
            <span>Status</span>
          </Link>
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-medium text-muted-foreground hover:text-foreground")}
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-medium text-muted-foreground hover:text-foreground")}
          >
            Sign In
          </Link>
          
          <ThemeToggle />

          <Link
            href="/register"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5 text-xs h-8 px-3 shadow-2xs font-semibold")}
          >
            <span>Get Started</span>
            <ArrowRight className="h-3 w-3 hidden sm:inline" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
