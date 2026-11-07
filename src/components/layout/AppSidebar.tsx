"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  LayoutDashboard,
  PlusCircle,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Monitors",
    href: "/monitors",
    icon: Activity,
  },
  {
    name: "Add Monitor",
    href: "/monitors/new",
    icon: PlusCircle,
  },
  {
    name: "Alert Channels",
    href: "/settings/alerts",
    icon: Bell,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface AppSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col justify-between border-r bg-card px-4 py-6 text-card-foreground",
        className
      )}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">APIWatch</span>
            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
              Monitoring Engine
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Panel */}
      <div className="rounded-xl border bg-muted/40 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Worker Status</span>
          <Badge
            variant="outline"
            className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 py-0"
          >
            ● Active
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <span>SSRF Protection Enabled</span>
        </div>
      </div>
    </aside>
  );
}
