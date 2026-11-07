import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  HelpCircle,
} from "lucide-react";
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
  showIcon = true,
}: StatusBadgeProps) {
  switch (status) {
    case "UP":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 font-medium",
            className
          )}
        >
          {showIcon && <CheckCircle2 className="h-3.5 w-3.5" />}
          UP
        </Badge>
      );
    case "DOWN":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1.5 font-medium",
            className
          )}
        >
          {showIcon && <AlertTriangle className="h-3.5 w-3.5" />}
          DOWN
        </Badge>
      );
    case "PAUSED":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30 gap-1.5 font-medium",
            className
          )}
        >
          {showIcon && <PauseCircle className="h-3.5 w-3.5" />}
          PAUSED
        </Badge>
      );
    case "UNKNOWN":
    default:
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 gap-1.5 font-medium",
            className
          )}
        >
          {showIcon && <HelpCircle className="h-3.5 w-3.5" />}
          UNKNOWN
        </Badge>
      );
  }
}
