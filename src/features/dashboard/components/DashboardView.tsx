"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  PlusCircle,
  TrendingDown,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ResponseTimeChart } from "./ResponseTimeChart";
import {
  MOCK_DASHBOARD_SUMMARY,
  MOCK_CHART_DATA,
  MOCK_INCIDENTS,
} from "../mocks";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const router = useRouter();
  const [viewState, setViewState] = useState<"normal" | "loading" | "empty" | "error">("normal");

  return (
    <div className="space-y-6">
      {/* State Switcher for UX Testing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-muted/30 p-2 text-xs">
        <span className="font-medium text-muted-foreground flex items-center gap-1.5 px-2">
          <Activity className="h-3.5 w-3.5 text-primary" />
          Preview UI States (Phase 5 Testing):
        </span>
        <Tabs value={viewState} onValueChange={(val) => setViewState(val as typeof viewState)}>
          <TabsList className="h-8">
            <TabsTrigger value="normal" className="text-xs">
              Live State
            </TabsTrigger>
            <TabsTrigger value="loading" className="text-xs">
              Loading State
            </TabsTrigger>
            <TabsTrigger value="empty" className="text-xs">
              Empty State
            </TabsTrigger>
            <TabsTrigger value="error" className="text-xs">
              Error State
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Page Header */}
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

      {/* Render based on viewState */}
      {viewState === "loading" && (
        <div className="space-y-6">
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
      )}

      {viewState === "empty" && (
        <EmptyState
          title="No Monitors Configured Yet"
          description="You haven't set up any API monitors. Add your first endpoint to start tracking availability, latency, and uptime."
          actionLabel="Add Your First Monitor"
          onAction={() => router.push("/monitors/new")}
        />
      )}

      {viewState === "error" && (
        <ErrorState
          title="Failed to Load Dashboard Summary"
          message="Could not retrieve the latest monitoring metrics from the worker queue. Please check your network and retry."
          onRetry={() => setViewState("normal")}
        />
      )}

      {viewState === "normal" && (
        <>
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
                  {MOCK_DASHBOARD_SUMMARY.totalMonitors}
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
                  {MOCK_DASHBOARD_SUMMARY.upMonitors}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {MOCK_DASHBOARD_SUMMARY.uptimePercentage}% system availability
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
                  {MOCK_DASHBOARD_SUMMARY.downMonitors}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  1 active incident ongoing
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
                  {MOCK_DASHBOARD_SUMMARY.avgResponseTimeMs} ms
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                  12ms faster than yesterday
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main 2-Column Split */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Response Time Chart + Quick Monitors */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chart Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Response Time Trend (Past 24 Hours)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Average latency measured across all active checks
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ResponseTimeChart data={MOCK_CHART_DATA} height={220} />
                </CardContent>
              </Card>

              {/* Quick Monitors List */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Recent Monitors
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Quick overview of primary endpoints
                    </CardDescription>
                  </div>
                  <Link
                    href="/monitors"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "gap-1 text-xs"
                    )}
                  >
                    View All
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardHeader>
                <CardContent className="divide-y p-0">
                  {[
                    {
                      id: "mon-1",
                      name: "Auth Service API",
                      url: "https://auth.example.com/health",
                      method: "GET",
                      status: "UP" as const,
                      latency: "112 ms",
                      checkedAt: "30s ago",
                    },
                    {
                      id: "mon-2",
                      name: "Payment Gateway Webhook",
                      url: "https://api.example.com/v1/payments",
                      method: "POST",
                      status: "DOWN" as const,
                      latency: "Timeout",
                      checkedAt: "1m ago",
                    },
                    {
                      id: "mon-3",
                      name: "Product Catalog Search",
                      url: "https://api.example.com/catalog/items",
                      method: "GET",
                      status: "UP" as const,
                      latency: "168 ms",
                      checkedAt: "2m ago",
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusBadge status={item.status} />
                        <div className="min-w-0">
                          <Link
                            href={`/monitors/${item.id}`}
                            className="font-medium text-sm hover:underline block truncate"
                          >
                            {item.name}
                          </Link>
                          <span className="font-mono text-xs text-muted-foreground block truncate">
                            {item.method} {item.url}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="font-mono text-sm font-semibold block">
                          {item.latency}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.checkedAt}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right 1 Col: Incident Log */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Recent Incidents
                  </CardTitle>
                  <CardDescription className="text-xs">
                    State transitions and failure notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  {MOCK_INCIDENTS.map((inc) => (
                    <div
                      key={inc.id}
                      className={cn(
                        "rounded-lg border p-3 space-y-1.5",
                        inc.eventType === "DOWN"
                          ? "border-rose-500/20 bg-rose-500/5"
                          : "border-emerald-500/20 bg-emerald-500/5"
                      )}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={cn(
                            "font-semibold",
                            inc.eventType === "DOWN"
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {inc.monitorName}
                        </span>
                        <span className="text-muted-foreground">
                          {inc.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {inc.message}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
