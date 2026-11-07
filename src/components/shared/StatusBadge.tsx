import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type MonitorStatusType = "UP" | "DOWN" | "PAUSED" | "UNKNOWN";

interface StatusBadgeProps {
  status: MonitorStatusType;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  className,
}: StatusBadgeProps) {
  switch (status) {
    case "UP":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-medium px-2 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1.5",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Operational</span>
        </Badge>
      );
    case "DOWN":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 font-medium px-2 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1.5",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <span>Down</span>
        </Badge>
      );
    case "PAUSED":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium px-2 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1.5",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>Paused</span>
        </Badge>
      );
    case "UNKNOWN":
    default:
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20 font-medium px-2 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1.5",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
          <span>Pending</span>
        </Badge>
      );
  }
}
