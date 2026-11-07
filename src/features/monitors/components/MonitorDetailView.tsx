"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { MOCK_MONITORS, MOCK_CHECK_HISTORY } from "../mocks";
import type { MonitorItem, MonitorCheckHistoryItem } from "../types";
import { cn } from "@/lib/utils";

interface MonitorDetailViewProps {
  id: string;
}

export function MonitorDetailView({ id }: MonitorDetailViewProps) {
  const router = useRouter();
  const initialMonitor =
    MOCK_MONITORS.find((m) => m.id === id) || MOCK_MONITORS[0];

  const [monitor, setMonitor] = useState<MonitorItem>(initialMonitor);
  const [history, setHistory] = useState<MonitorCheckHistoryItem[]>(MOCK_CHECK_HISTORY);
  const [isChecking, setIsChecking] = useState(false);
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(null);

  // Chart data from history
  const chartData = [
    { time: "10m ago", latency: 92 },
    { time: "8m ago", latency: 86 },
    { time: "6m ago", latency: 98 },
    { time: "4m ago", latency: 84 },
    { time: "2m ago", latency: 94 },
    { time: "Just now", latency: 88 },
  ];

  const handleManualCheck = async () => {
    setIsChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsChecking(false);

    const newCheck: MonitorCheckHistoryItem = {
      id: `chk-${Date.now()}`,
      monitorId: monitor.id,
      status: "SUCCESS",
      httpStatus: 200,
      responseTimeMs: Math.floor(Math.random() * 40) + 75,
      checkedAt: "Just now",
    };

    setHistory((prev) => [newCheck, ...prev]);
    setMonitor((prev) => ({
      ...prev,
      lastResponseTimeMs: newCheck.responseTimeMs,
      lastCheckedAt: "Just now",
    }));

    toast.success("Manual check complete", {
      description: `Target returned HTTP 200 OK (${newCheck.responseTimeMs} ms)`,
    });
  };

  const handleTogglePause = () => {
    const nextStatus = monitor.status === "PAUSED" ? "UP" : "PAUSED";
    setMonitor((prev) => ({ ...prev, status: nextStatus }));
    toast.success(
      nextStatus === "PAUSED" ? "Monitor paused" : "Monitor resumed",
      {
        description: `Background worker checks ${
          nextStatus === "PAUSED" ? "halted" : "resumed"
        }`,
      }
    );
  };

  const handleDelete = () => {
    toast.success("Monitor deleted", {
      description: `Removed "${monitor.name}"`,
    });
    router.push("/monitors");
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/monitors"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Monitors
        </Link>
        <span>/</span>
        <span className="font-mono text-xs">{monitor.name}</span>
      </div>

      {/* Header Panel with Quick Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {monitor.name}
            </h1>
            <StatusBadge status={monitor.status} />
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {monitor.method} {monitor.url} • Interval: {monitor.intervalSeconds}s • Timeout: {monitor.timeoutMs}ms
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualCheck}
            disabled={isChecking}
            className="gap-1.5"
          >
            {isChecking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            {isChecking ? "Checking..." : "Check Now"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePause}
            className="gap-1.5"
          >
            {monitor.status === "PAUSED" ? (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-500" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-500" />
                Pause
              </>
            )}
          </Button>

          <Link
            href="/monitors/new"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5"
            )}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Link>

          <ConfirmDialog
            title="Delete this Monitor?"
            description={`Are you sure you want to delete "${monitor.name}"? This action cannot be undone.`}
            confirmLabel="Delete Monitor"
            onConfirm={handleDelete}
            trigger={
              <Button variant="destructive" size="sm" className="gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            }
          />
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Uptime (24 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {monitor.uptime24h || 99.8}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              7-day: {monitor.uptime7d || 99.9}% • 30-day: {monitor.uptime30d || 99.7}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Last Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitor.lastResponseTimeMs ? `${monitor.lastResponseTimeMs} ms` : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Evaluated {monitor.lastCheckedAt || "recently"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <span
                className={cn(
                  "h-3 w-3 rounded-full",
                  monitor.status === "UP"
                    ? "bg-emerald-500"
                    : monitor.status === "DOWN"
                    ? "bg-rose-500"
                    : "bg-zinc-500"
                )}
              />
              {monitor.status}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expected Status: [{monitor.expectedStatusCodes.join(", ")}]
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Chart (Recharts) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Response Time Analytics
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time round-trip latency (ms) for recent checks
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(150, 150, 150, 0.15)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}ms`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-popover p-2 shadow-md text-xs">
                          <p className="font-semibold">{label}</p>
                          <p className="text-blue-500 font-mono">
                            {payload[0].value} ms
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#3b82f6" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Checks History Table with Expandable Failure Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Inspection History Log
          </CardTitle>
          <CardDescription className="text-xs">
            Chronological records executed by the background worker engine
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[130px]">Status</TableHead>
                <TableHead>HTTP Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead className="text-right">Checked At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((check) => {
                const isFailed = check.status !== "SUCCESS";
                const isExpanded = expandedCheckId === check.id;

                return (
                  <React.Fragment key={check.id}>
                    <TableRow
                      onClick={() =>
                        isFailed &&
                        setExpandedCheckId(isExpanded ? null : check.id)
                      }
                      className={cn(
                        "transition-colors",
                        isFailed && "cursor-pointer hover:bg-rose-500/5",
                        isExpanded && "bg-rose-500/10"
                      )}
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs gap-1 font-medium",
                            check.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : check.status === "TIMEOUT"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          )}
                        >
                          {check.status === "SUCCESS" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : check.status === "TIMEOUT" ? (
                            <AlertCircle className="h-3 w-3" />
                          ) : (
                            <HelpCircle className="h-3 w-3" />
                          )}
                          {check.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {check.httpStatus ? `${check.httpStatus} OK` : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {check.responseTimeMs
                          ? `${check.responseTimeMs} ms`
                          : "Timed out"}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {check.checkedAt}
                      </TableCell>
                    </TableRow>

                    {/* Expandable Failure Reason Accordion */}
                    {isExpanded && check.failureReason && (
                      <TableRow className="bg-rose-500/5 border-t-0">
                        <TableCell colSpan={4} className="py-2.5 px-4">
                          <div className="rounded-md border border-rose-500/20 bg-background/80 p-3 text-xs space-y-1">
                            <span className="font-semibold text-rose-600 dark:text-rose-400 block">
                              Failure Details:
                            </span>
                            <p className="font-mono text-muted-foreground">
                              {check.failureReason}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
