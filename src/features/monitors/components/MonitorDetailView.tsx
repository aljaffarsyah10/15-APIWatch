"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Trash2,
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
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { monitorApi, type MonitorDetailData } from "../api";
import type { MonitorCheckHistoryItem } from "../types";
import { getErrorMessage } from "@/lib/api/error";
import { cn } from "@/lib/utils";

interface MonitorDetailViewProps {
  id: string;
}

export function MonitorDetailView({ id }: MonitorDetailViewProps) {
  const router = useRouter();
  const [monitor, setMonitor] = useState<MonitorDetailData | null>(null);
  const [history, setHistory] = useState<MonitorCheckHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const reloadData = async () => {
    try {
      const [monitorData, checksData] = await Promise.all([
        monitorApi.getById(id),
        monitorApi.getChecks(id, 1, 50),
      ]);
      setMonitor(monitorData);
      setHistory(checksData.checks);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      monitorApi.getById(id),
      monitorApi.getChecks(id, 1, 50),
    ])
      .then(([monitorData, checksData]) => {
        if (isMounted) {
          setMonitor(monitorData);
          setHistory(checksData.checks);
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

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleTogglePause = async () => {
    if (!monitor) return;
    try {
      if (monitor.status === "PAUSED") {
        await monitorApi.resume(monitor.id);
        toast.success("Monitor resumed", {
          description: "Scheduled checks are active again",
        });
      } else {
        await monitorApi.pause(monitor.id);
        toast.success("Monitor paused", {
          description: "Checks temporarily suspended",
        });
      }
      await reloadData();
    } catch (err: unknown) {
      toast.error("Failed to update status", {
        description: getErrorMessage(err),
      });
    }
  };

  const handleDelete = async () => {
    if (!monitor) return;
    try {
      await monitorApi.delete(monitor.id);
      toast.success("Monitor deleted", {
        description: `Removed "${monitor.name}"`,
      });
      router.push("/monitors");
    } catch (err: unknown) {
      toast.error("Failed to delete monitor", {
        description: getErrorMessage(err),
      });
    }
  };

  const handleManualCheck = async () => {
    if (!monitor) return;
    setIsChecking(true);
    try {
      const result = await monitorApi.checkNow(monitor.id);
      await reloadData();
      toast.success("Manual check complete", {
        description: `Target returned ${result.status} (${
          result.responseTimeMs ? `${result.responseTimeMs} ms` : "No response"
        })`,
      });
    } catch (err: unknown) {
      toast.error("Manual check failed", {
        description: getErrorMessage(err),
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (error || !monitor) {
    return (
      <div className="space-y-6 max-w-5xl">
        <ErrorState
          title="Failed to Load Monitor Details"
          message={error || "Monitor not found"}
          onRetry={() => {
            setIsLoading(true);
            reloadData();
          }}
        />
      </div>
    );
  }

  // Generate chart data from real checks
  const chartData = history
    .filter((c) => typeof c.responseTimeMs === "number")
    .slice(0, 15)
    .reverse()
    .map((c) => ({
      time: new Date(c.checkedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      latency: c.responseTimeMs,
    }));

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/monitors"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Monitors
        </Link>
      </div>

      {/* Monitor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="font-mono text-xs">
              {monitor.method}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight">{monitor.name}</h1>
            <StatusBadge status={monitor.status} />
          </div>
          <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
            <span>{monitor.url}</span>
            <span>•</span>
            <span>Check every {monitor.intervalSeconds}s</span>
            <span>•</span>
            <span>Timeout: {monitor.timeoutMs}ms</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <a
            href={monitorApi.getExportUrl(monitor.id)}
            download
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5"
            )}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualCheck}
            disabled={isChecking || monitor.status === "PAUSED"}
            className="gap-1.5"
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Check Now
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePause}
            className="gap-1.5"
          >
            {monitor.status === "PAUSED" ? (
              <>
                <Play className="h-4 w-4 text-emerald-500" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 text-amber-500" />
                Pause
              </>
            )}
          </Button>

          <ConfirmDialog
            title="Delete Monitor?"
            description={`Are you sure you want to delete "${monitor.name}"? This action cannot be undone.`}
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={handleDelete}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            }
          />
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Uptime Percentage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {monitor.uptimePercentage ?? 100}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Across completed checks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Average Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitor.avgLatencyMs ? `${monitor.avgLatencyMs} ms` : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Arithmetic mean response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              P95 Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitor.p95LatencyMs ? `${monitor.p95LatencyMs} ms` : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              95th percentile latency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Last Successful At
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold truncate mt-1">
              {monitor.lastCheckedAt
                ? new Date(monitor.lastCheckedAt).toLocaleString()
                : "Awaiting first check"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Target response validated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latency History Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Response Time Trend
          </CardTitle>
          <CardDescription className="text-xs">
            Latency history across recent check events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              Awaiting check execution data to build chart...
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="time"
                    className="text-[10px] text-muted-foreground"
                    tickLine={false}
                  />
                  <YAxis
                    className="text-[10px] text-muted-foreground"
                    tickLine={false}
                    unit="ms"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border)",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Recent Check History
          </CardTitle>
          <CardDescription className="text-xs">
            Log of checks executed by the worker engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No checks recorded yet. Checks will appear here as the worker processes them.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>HTTP Code</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Failure Reason</TableHead>
                    <TableHead className="text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell>
                        <Badge
                          variant={check.status === "SUCCESS" ? "outline" : "destructive"}
                          className={cn(
                            "text-[10px]",
                            check.status === "SUCCESS" &&
                              "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                          )}
                        >
                          {check.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {check.httpStatus ? check.httpStatus : "—"}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {check.responseTimeMs ? `${check.responseTimeMs} ms` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-rose-500 max-w-xs truncate">
                        {check.failureReason || "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {new Date(check.checkedAt).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
