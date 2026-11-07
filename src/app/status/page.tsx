import React, { Suspense } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import prisma from "@/lib/db/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "APIWatch System Status",
  description:
    "Real-time operational status, system uptime, and incident reports for APIWatch monitored services.",
  openGraph: {
    title: "APIWatch System Status",
    description: "Live system availability and uptime performance.",
  },
};

export default function PublicStatusPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-blue-500/20 selection:text-blue-500">
      {/* Top Banner Header */}
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm ring-1 ring-blue-500/30 group-hover:scale-105 transition-transform">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">APIWatch Status</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content inside Suspense */}
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8 flex-1 w-full">
        <Suspense fallback={<StatusSkeleton />}>
          <StatusContent />
        </Suspense>

        {/* Footer info */}
        <footer className="text-center text-xs text-muted-foreground pt-8 border-t border-border/60">
          <p>
            Powered by{" "}
            <Link href="/" className="font-semibold text-foreground hover:underline">
              APIWatch
            </Link>{" "}
            — High-concurrency API monitoring &amp; automated incident detection.
          </p>
        </footer>
      </main>
    </div>
  );
}

function StatusSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

async function StatusContent() {
  let monitors: Array<{
    id: string;
    name: string;
    method: string;
    status: string;
    lastCheckedAt: Date | null;
  }> = [];

  try {
    monitors = await prisma.monitor.findMany({
      where: { isActive: true },
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        method: true,
        status: true,
        lastCheckedAt: true,
      },
    });
  } catch {
    monitors = [];
  }

  const downCount = monitors.filter((m) => m.status === "DOWN").length;
  const isAllOperational = downCount === 0;

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <div
        className={`p-6 rounded-xl border flex items-center gap-4 transition-all shadow-2xs ${
          isAllOperational
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
            : "bg-rose-500/5 border-rose-500/20 text-rose-900 dark:text-rose-200"
        }`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full shrink-0 ${
            isAllOperational ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          {isAllOperational ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {isAllOperational
              ? "All Systems Fully Operational"
              : `${downCount} Monitored Service${downCount > 1 ? "s" : ""} Experiencing Issues`}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAllOperational
              ? "All monitored services and external endpoints are responding within acceptable latency thresholds."
              : "Our automated monitoring engine detected anomalies in some endpoints. Engineers are investigating."}
          </p>
        </div>
      </div>

      {/* Services List Card */}
      <Card>
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Monitored Services</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Current availability and live operational state
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Live Telemetry</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2 divide-y divide-border/60">
          {monitors.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No public monitors active at this time.
            </div>
          ) : (
            monitors.map((m) => (
              <div key={m.id} className="py-3.5 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-secondary text-secondary-foreground uppercase">
                      {m.method}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{m.name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Last probe: {m.lastCheckedAt ? new Date(m.lastCheckedAt).toLocaleTimeString() : "Pending"}
                  </p>
                </div>
                <div>
                  {m.status === "UP" ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-medium px-2 py-0.5 rounded-full text-xs flex items-center gap-1.5"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>Operational</span>
                    </Badge>
                  ) : m.status === "DOWN" ? (
                    <Badge
                      variant="outline"
                      className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 font-medium px-2 py-0.5 rounded-full text-xs flex items-center gap-1.5"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                      <span>Service Disruption</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium px-2 py-0.5 rounded-full text-xs flex items-center gap-1.5"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>Paused / Maintenance</span>
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
