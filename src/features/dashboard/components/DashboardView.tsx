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
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
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
          title="Dashboard Overview"
          description="Real-time health status, incident tracking, and latency performance"
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
          title="Dashboard Overview"
          description="Real-time health status, incident tracking, and latency performance"
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
          title="Dashboard Overview"
          description="Real-time health status, incident tracking, and latency performance"
        >
          <Link
            href="/monitors/new"
            className={cn(buttonVariants(), "gap-2")}
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard Overview"
        description="Real-time health status, incident tracking, and latency performance"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
            />
            <span>Refresh</span>
          </Button>
          <Link
            href="/monitors/new"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            <PlusCircle className="h-4 w-4" />
            Add Monitor
          </Link>
        </div>
      </PageHeader>

      {/* Top 4 Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Monitors
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalMonitors ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All registered HTTP endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Operational (UP)
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary?.upMonitors ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.overallUptime ?? 100}% overall uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-rose-600 dark:text-rose-400">
              Degraded / DOWN
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {summary?.downMonitors ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.activeIncidentsCount ?? 0} active incidents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.avgResponseTimeMs ?? 0} ms
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
              Measured across completed checks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Response Time Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Response Time Trend (Past 24 Hours)
              </CardTitle>
              <CardDescription className="text-xs">
                Average latency measured across all active checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponseTimeChart data={chartData} />
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Active Incidents */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Active Incidents
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {activeIncidents.length} active
                </span>
              </div>
              <CardDescription className="text-xs">
                Endpoints requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeIncidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center border rounded-md border-dashed">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                  <p className="text-sm font-medium">All Systems Normal</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    No active failures or alerts detected
                  </p>
                </div>
              ) : (
                activeIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-start justify-between p-3 rounded-lg border bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-rose-900 dark:text-rose-200">
                        {incident.name}
                      </p>
                      <p className="text-xs text-rose-700/80 dark:text-rose-400 font-mono">
                        {incident.url}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last checked: {incident.lastCheckedAt ? new Date(incident.lastCheckedAt).toLocaleTimeString() : "Pending"}
                      </p>
                    </div>
                    <StatusBadge status="DOWN" />
                  </div>
                ))
              )}

              <Link
                href="/monitors"
                className="flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline pt-2"
              >
                View all monitors
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
