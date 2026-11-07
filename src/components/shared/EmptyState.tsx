import React from "react";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-card/40 p-8 text-center",
        className
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-3.5">
        {icon || <Activity className="h-5 w-5" />}
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <div className="mt-5">
          <Button size="sm" onClick={onAction} className="h-8 px-4 text-xs font-semibold shadow-2xs">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
