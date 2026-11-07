"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { UserNav } from "@/components/layout/UserNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useSession } from "@/lib/auth/auth-client";

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Generate clean breadcrumb title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/monitors") return "All Monitors";
    if (pathname === "/monitors/new") return "Create Monitor";
    if (pathname.startsWith("/monitors/")) return "Monitor Telemetry";
    if (pathname === "/settings/alerts") return "Alert Channels";
    if (pathname === "/settings") return "Settings";
    return "APIWatch";
  };

  const user = session?.user
    ? { name: session.user.name, email: session.user.email }
    : undefined;

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/80 bg-background/85 px-4 sm:px-6 backdrop-blur-md shadow-2xs">
      {/* Left: Mobile Drawer & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 -ml-2"
                aria-label="Open mobile menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-64 border-r border-border">
            <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
            <AppSidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Brand for Mobile when sidebar is closed */}
        <Link
          href="/dashboard"
          className="flex md:hidden items-center gap-2 font-bold tracking-tight text-sm"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white shadow-2xs">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <span>APIWatch</span>
        </Link>

        {/* Desktop Breadcrumb / Title */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium">
          <span className="text-muted-foreground/80 hover:text-foreground transition-colors">
            Workspace
          </span>
          <span className="text-muted-foreground/40 font-mono">/</span>
          <span className="font-bold text-foreground tracking-tight text-sm">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Right: Live Engine Badge, Theme Toggle & User Nav */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Badge
          variant="outline"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 to-teal-500/10 font-bold rounded-full shadow-2xs"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Engine Online
        </Badge>

        <ThemeToggle />

        <div className="h-4 w-px bg-border/80 mx-0.5" />

        <UserNav user={user} />
      </div>
    </header>
  );
}
