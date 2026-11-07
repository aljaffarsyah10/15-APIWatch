import React from "react";
import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">APIWatch</span>
          <Badge variant="outline" className="text-xs font-medium">
            MVP
          </Badge>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
