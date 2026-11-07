import React from "react";
import Link from "next/link";
import { Activity, ArrowRight, Radio } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-lg shadow-2xs">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-sm ring-1 ring-blue-500/30 group-hover:scale-105 transition-transform duration-200">
            <Activity className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-foreground">APIWatch</span>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-full bg-gradient-to-r from-blue-500/15 to-indigo-500/15 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20">
            PRO
          </span>
        </Link>
        
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/status"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground hidden sm:inline-flex")}
          >
            <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
            <span>Live Status</span>
          </Link>
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-semibold text-muted-foreground hover:text-foreground")}
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-semibold text-muted-foreground hover:text-foreground")}
          >
            Sign In
          </Link>
          
          <ThemeToggle />

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs font-semibold h-8 px-3.5 rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all duration-200 active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3 w-3 hidden sm:inline" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
