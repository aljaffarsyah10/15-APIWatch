import React, { Suspense } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="min-h-screen bg-background">
      {/* Top Banner Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Activity className="h-5 w-5 text-primary" />
            <span>APIWatch Status</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content inside Suspense */}
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <Suspense fallback={<StatusSkeleton />}>
          <StatusContent />
        </Suspense>

        {/* Footer info */}
        <footer className="text-center text-xs text-muted-foreground pt-4 border-t">
          <p>
            Powered by{" "}
            <Link href="/" className="font-medium text-foreground hover:underline">
              APIWatch
            </Link>{" "}
            — High-concurrency API monitoring & automated incident detection.
          </p>
        </footer>
      </main>
    </div>
  );
}

function StatusSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-xl" />
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
    <>
      {/* Overall Status Banner */}
      <div
        className={`p-6 rounded-xl border flex items-center gap-4 ${
          isAllOperational
            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
            : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
        }`}
      >
        {isAllOperational ? (
          <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
        ) : (
          <AlertTriangle className="h-8 w-8 text-rose-500 shrink-0" />
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {isAllOperational
              ? "All Systems Operational"
              : `${downCount} Service${downCount > 1 ? "s" : ""} Experiencing Issues`}
          </h1>
          <p className="text-xs opacity-90 mt-0.5">
            Automated monitoring engine verifies availability across all registered endpoints.
          </p>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Public Monitored Services</h2>
          <span className="text-xs text-muted-foreground">
            {monitors.length} Services Registered
          </span>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Operational Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {monitors.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No public services registered at this time.
              </div>
            ) : (
              monitors.map((service) => (
                <div
                  key={service.id}
                  className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono px-1 py-0">
                        {service.method}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">
                        {service.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Last inspected:{" "}
                      {service.lastCheckedAt
                        ? new Date(service.lastCheckedAt).toLocaleTimeString()
                        : "Scheduled"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        service.status === "UP"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : service.status === "DOWN"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : "bg-muted text-muted-foreground border"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          service.status === "UP"
                            ? "bg-emerald-500"
                            : service.status === "DOWN"
                            ? "bg-rose-500 animate-pulse"
                            : "bg-muted-foreground"
                        }`}
                      />
                      {service.status === "UP"
                        ? "Operational"
                        : service.status === "DOWN"
                        ? "Incident"
                        : service.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
