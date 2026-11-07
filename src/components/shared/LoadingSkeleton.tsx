import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
  type?: "card" | "table" | "chart";
}

export function LoadingSkeleton({
  count = 3,
  className,
  type = "card",
}: LoadingSkeletonProps) {
  if (type === "card") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className={cn("rounded-xl border divide-y", className)}>
        <div className="p-4 bg-muted/40">
          <Skeleton className="h-4 w-48" />
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-16 rounded-md" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border p-6 space-y-4", className)}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}
