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

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Generate clean breadcrumb title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard Overview";
    if (pathname === "/monitors") return "Monitors";
    if (pathname === "/monitors/new") return "Add Monitor";
    if (pathname.startsWith("/monitors/")) return "Monitor Detail";
    if (pathname === "/settings/alerts") return "Alert Settings";
    if (pathname === "/settings") return "Account Settings";
    return "APIWatch";
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Drawer & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 -ml-2"
                aria-label="Open mobile menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
            <AppSidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Brand for Mobile when sidebar is closed */}
        <Link
          href="/dashboard"
          className="flex md:hidden items-center gap-1.5 font-bold tracking-tight text-sm"
        >
          <Activity className="h-4 w-4 text-primary" />
          <span>APIWatch</span>
        </Link>

        {/* Desktop Breadcrumb / Title */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Workspace</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="font-medium text-foreground">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right: Live Status Badge & User Nav */}
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 font-medium"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Engine Active
        </Badge>

        <UserNav />
      </div>
    </header>
  );
}
