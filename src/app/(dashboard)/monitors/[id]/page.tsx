import React, { Suspense } from "react";
import { MonitorDetailView } from "@/features/monitors/components/MonitorDetailView";
import { Skeleton } from "@/components/ui/skeleton";

export default function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<MonitorDetailSkeleton />}>
      <MonitorDetailLoader params={params} />
    </Suspense>
  );
}

function MonitorDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}

async function MonitorDetailLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MonitorDetailView id={id} />;
}
