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
    <div className="min-h-screen bg-transparent relative flex flex-col selection:bg-blue-500/20 selection:text-blue-600">
      {/* Dynamic Ambient Mesh Glows (Light & Dark) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
      >
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/18 via-blue-500/12 to-transparent blur-3xl dark:from-blue-600/15 dark:via-indigo-900/15 animate-pulse-subtle" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-gradient-to-bl from-sky-400/18 via-teal-400/10 to-transparent blur-3xl dark:from-sky-700/12 dark:via-emerald-950/15" />
        <div className="absolute inset-0 bg-tech-grid [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 dark:opacity-20" />
      </div>
      {/* Top Banner Header */}
      <header className="border-b border-border/80 bg-background/85 backdrop-blur-md sticky top-0 z-40 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-blue-500/30 group-hover:scale-105 transition-transform duration-200">
              <Activity className="h-4.5 w-4.5" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-foreground">APIWatch Status</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors bg-card px-2.5 py-1 rounded-md border border-border/60 shadow-2xs"
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
            <Link href="/" className="font-bold text-foreground hover:underline">
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
      {/* Overall Status Banner with Ambient Glow */}
      <div
        className={`p-6 rounded-2xl border flex items-center gap-4 transition-all shadow-xs ${
          isAllOperational
            ? "bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
            : "bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-amber-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200"
        }`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full shrink-0 shadow-2xs ${
            isAllOperational
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/25 animate-pulse-subtle"
              : "bg-rose-500/20 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/25 animate-pulse"
          }`}
        >
          {isAllOperational ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            {isAllOperational
              ? "All Systems Fully Operational"
              : `${downCount} Monitored Service${downCount > 1 ? "s" : ""} Experiencing Issues`}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {isAllOperational
              ? "All monitored services and external endpoints are responding within acceptable latency thresholds."
              : "Our automated monitoring engine detected anomalies in some endpoints. Automated alerts have been dispatched."}
          </p>
        </div>
      </div>

      {/* Services List Card */}
      <Card className="card-elevated border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-3.5 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Monitored Services</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Current availability and live operational state
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-card px-2.5 py-1 rounded-md border border-border/60 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-foreground">Live Telemetry</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2 divide-y divide-border/60">
          {monitors.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground font-medium">
              No public monitors active at this time.
            </div>
          ) : (
            monitors.map((m) => (
              <div key={m.id} className="py-3.5 px-1 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border bg-secondary text-secondary-foreground uppercase shadow-2xs">
                      {m.method}
                    </span>
                    <span className="text-sm font-bold text-foreground">{m.name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono font-medium">
                    Last probe: {m.lastCheckedAt ? new Date(m.lastCheckedAt).toLocaleTimeString() : "Pending"}
                  </p>
                </div>
                <div>
                  {m.status === "UP" ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 font-bold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>Operational</span>
                    </Badge>
                  ) : m.status === "DOWN" ? (
                    <Badge
                      variant="outline"
                      className="bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30 font-bold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                      <span>Service Disruption</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1.5 shadow-2xs"
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
