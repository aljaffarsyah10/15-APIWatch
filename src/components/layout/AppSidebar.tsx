"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  ExternalLink,
  LayoutDashboard,
  PlusCircle,
  Radio,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const navigationSections = [
  {
    title: "MONITORING",
    items: [
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
    ],
  },
  {
    title: "ALERTS & STATUS",
    items: [
      {
        name: "Alert Channels",
        href: "/settings/alerts",
        icon: Bell,
      },
      {
        name: "Public Status",
        href: "/status",
        icon: Radio,
        external: true,
      },
    ],
  },
  {
    title: "PREFERENCES",
    items: [
      {
        name: "Account & Keys",
        href: "/settings",
        icon: Settings,
      },
    ],
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
        "flex h-full w-64 flex-col justify-between border-r bg-card/60 backdrop-blur-sm px-3.5 py-5 text-card-foreground",
        className
      )}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-2 py-1 group transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm ring-1 ring-blue-500/30">
            <Activity className="h-4 w-4 transition-transform group-hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
              APIWatch
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
                PRO
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              v1.0.0 · Production
            </span>
          </div>
        </Link>

        {/* Categorized Navigation */}
        <div className="space-y-5">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                {section.title}
              </p>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname === item.href ||
                        (item.href !== "/" &&
                          pathname.startsWith(item.href) &&
                          item.href !== "/monitors/new");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      target={item.external ? "_blank" : undefined}
                      className={cn(
                        "group flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-secondary text-foreground font-semibold shadow-2xs"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.external && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Status Panel */}
      <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Scheduler</span>
          <Badge
            variant="outline"
            className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-0 px-1.5 font-medium flex items-center gap-1"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Healthy
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span>SSRF Shield Active</span>
        </div>
      </div>
    </aside>
  );
}
