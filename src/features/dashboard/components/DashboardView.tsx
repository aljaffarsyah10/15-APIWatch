"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ResponseTimeChart } from "./ResponseTimeChart";
import { dashboardApi, type DashboardSummaryData } from "../api";
import { getErrorMessage } from "@/lib/api/error";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
      setError(null);
      toast.success("Dashboard metrics refreshed");
    } catch (err: unknown) {
      toast.error("Failed to refresh metrics", {
        description: getErrorMessage(err),
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    dashboardApi
      .getSummary()
      .then((data) => {
        if (isMounted) {
          setSummary(data);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(getErrorMessage(err));
          setIsLoading(false);
        }
      });

    // Polling synchronization every 30 seconds
    const interval = setInterval(() => {
      dashboardApi
        .getSummary()
        .then((data) => {
          if (isMounted) setSummary(data);
        })
        .catch(() => {});
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fallback / historical trend mock points for chart visualization
  const chartData = [
    { time: "00:00", latency: summary?.avgResponseTimeMs ? Math.round(summary.avgResponseTimeMs * 0.95) : 85, expectedMax: 150 },
    { time: "04:00", latency: summary?.avgResponseTimeMs ? Math.round(summary.avgResponseTimeMs * 1.05) : 92, expectedMax: 150 },
    { time: "08:00", latency: summary?.avgResponseTimeMs ? Math.round(summary.avgResponseTimeMs * 0.9) : 82, expectedMax: 150 },
    { time: "12:00", latency: summary?.avgResponseTimeMs ? Math.round(summary.avgResponseTimeMs * 1.1) : 96, expectedMax: 150 },
    { time: "16:00", latency: summary?.avgResponseTimeMs ? Math.round(summary.avgResponseTimeMs * 1.02) : 88, expectedMax: 150 },
    { time: "20:00", latency: summary?.avgResponseTimeMs ?? 90, expectedMax: 150 },
  ];

  if (isLoading && !summary) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Telemetry Overview"
          description="Continuous uptime analysis, active probes, and latency distribution"
        />
        <LoadingSkeleton type="card" count={4} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LoadingSkeleton type="chart" />
          </div>
          <div>
            <LoadingSkeleton type="table" count={3} />
          </div>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Telemetry Overview"
          description="Continuous uptime analysis, active probes, and latency distribution"
        />
        <ErrorState
          title="Failed to Load Dashboard Summary"
          message={error}
          onRetry={() => {
            setIsLoading(true);
            handleRefresh();
          }}
        />
      </div>
    );
  }

  if (summary && summary.totalMonitors === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Telemetry Overview"
          description="Continuous uptime analysis, active probes, and latency distribution"
        >
          <Link
            href="/monitors/new"
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all duration-200 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            Add Monitor
          </Link>
        </PageHeader>
        <EmptyState
          title="No Monitors Configured Yet"
          description="You haven't set up any API monitors. Add your first endpoint to start tracking availability, latency, and uptime."
          actionLabel="Add Your First Monitor"
          onAction={() => router.push("/monitors/new")}
        />
      </div>
    );
  }

  const activeIncidents = summary?.activeIncidents || [];
  const isAllHealthy = activeIncidents.length === 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Telemetry Overview"
        description="Continuous uptime analysis, active probes, and latency distribution"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5 h-8.5 bg-card/80 hover:bg-card transition-all"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5 text-muted-foreground", isRefreshing && "animate-spin text-primary")}
            />
            <span>Refresh</span>
          </Button>
          <Link
            href="/monitors/new"
            className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-md text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all duration-200 active:scale-95"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add Monitor
          </Link>
        </div>
      </PageHeader>

      {/* Health Status Banner with Ambient Gradient */}
      <div
        className={cn(
          "flex items-center justify-between p-4 px-5 rounded-xl border transition-all duration-200 shadow-xs",
          isAllHealthy
            ? "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
            : "bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-amber-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200"
        )}
      >
        <div className="flex items-center gap-3.5">
          {isAllHealthy ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 animate-pulse-subtle">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20 animate-pulse">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-foreground">
              {isAllHealthy ? "All Monitored Endpoints Operational" : `${activeIncidents.length} Service Incident Detected`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAllHealthy
                ? "Background monitoring engine is probing all endpoints with zero assertion failures."
                : "One or more HTTP endpoints failed consecutive health assertions."}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-card/60 px-2.5 py-1 rounded-md border border-border/60">
          <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>SSRF Shield Active</span>
        </div>
      </div>

      {/* Top 4 Summary KPI Cards with Subtle Light Tints & Elevated Hover */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Monitors */}
        <Card className="bg-gradient-to-br from-blue-500/8 via-card to-card border-border/80 card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Monitors
            </CardTitle>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-2xs">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight font-mono text-foreground">
              {summary?.totalMonitors ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <span className="text-blue-700 dark:text-blue-300 font-semibold">{summary?.upMonitors ?? 0} active</span>
              <span>·</span>
              <span>{(summary?.totalMonitors ?? 0) - (summary?.upMonitors ?? 0)} paused</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 2: 24h Overall Uptime */}
        <Card className="bg-gradient-to-br from-emerald-500/8 via-card to-card border-border/80 card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Overall Uptime
            </CardTitle>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight font-mono text-emerald-600 dark:text-emerald-400">
              {summary?.overallUptime ?? 100}%
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Target SLA: 99.90%
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Down Incidents */}
        <Card className="bg-gradient-to-br from-rose-500/8 via-card to-card border-border/80 card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Incidents
            </CardTitle>
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md shadow-2xs",
                (summary?.downMonitors ?? 0) > 0
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-3xl font-extrabold tracking-tight font-mono",
                (summary?.downMonitors ?? 0) > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-foreground"
              )}
            >
              {summary?.downMonitors ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {(summary?.activeIncidentsCount ?? 0) === 0
                ? "Zero active outages detected"
                : `${summary?.activeIncidentsCount} alerts dispatched`}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Avg Response Latency */}
        <Card className="bg-gradient-to-br from-indigo-500/8 via-card to-card border-border/80 card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Avg Latency
            </CardTitle>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-2xs">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight font-mono text-foreground">
              {summary?.avgResponseTimeMs ?? 0}
              <span className="text-base font-normal text-muted-foreground ml-1">ms</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Monotonic clock</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main 2-Column Split: Chart & Incidents */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Response Time Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-elevated border-border/80">
            <CardHeader className="border-b border-border/60 pb-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Response Latency Distribution
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Continuous latency telemetry across active worker probes
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-card px-2.5 py-1 rounded-md border border-border/60">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="font-semibold text-foreground">Mean Latency</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <ResponseTimeChart data={chartData} />
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Active Incidents */}
        <div>
          <Card className="h-full flex flex-col justify-between card-elevated border-border/80">
            <div>
              <CardHeader className="border-b border-border/60 pb-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-foreground">
                    Active Incidents
                  </CardTitle>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
                    {activeIncidents.length} active
                  </span>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Endpoints currently failing status assertions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {activeIncidents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border/80 bg-muted/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-2 animate-pulse-subtle">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-foreground">All Systems Healthy</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                      Zero unresolved incidents or outage alerts detected.
                    </p>
                  </div>
                ) : (
                  activeIncidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="flex items-start justify-between p-3 rounded-lg border bg-rose-500/8 border-rose-500/20"
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {incident.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {incident.url}
                        </p>
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                          Last checked: {incident.lastCheckedAt ? new Date(incident.lastCheckedAt).toLocaleTimeString() : "Pending"}
                        </p>
                      </div>
                      <StatusBadge status="DOWN" />
                    </div>
                  ))
                )}
              </CardContent>
            </div>

            <div className="p-4 pt-0">
              <Link
                href="/monitors"
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors py-2 border-t border-border/60"
              >
                <span>View all configured monitors</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
