"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
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
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

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

  const handleManualCheck = async () => {
    if (!monitor) return;
    setIsChecking(true);
    try {
      const result = await monitorApi.checkNow(monitor.id);
      toast.success("Check Completed", {
        description: `Status: ${result.httpStatus ?? "OK"} · Response time: ${result.responseTimeMs ?? 0}ms`,
      });
      await reloadData();
    } catch (err: unknown) {
      toast.error("Manual check failed", {
        description: getErrorMessage(err),
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleDelete = async () => {
    if (!monitor) return;
    try {
      await monitorApi.delete(monitor.id);
      toast.success("Monitor deleted");
      router.push("/monitors");
      router.refresh();
    } catch (err: unknown) {
      toast.error("Failed to delete", {
        description: getErrorMessage(err),
      });
    }
  };

  if (isLoading && !monitor) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (error && !monitor) {
    return (
      <ErrorState
        title="Failed to Load Monitor Details"
        message={error}
        onRetry={() => {
          setIsLoading(true);
          reloadData();
        }}
      />
    );
  }

  if (!monitor) return null;

  // Transform check history for chart visualization
  const chartData = [...history]
    .reverse()
    .slice(-30)
    .map((c) => ({
      time: new Date(c.checkedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      latency: c.responseTimeMs ?? 0,
    }));

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/monitors"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Monitors</span>
        </Link>
      </div>

      {/* Monitor Header Profile */}
      <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between border-b border-border/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded border bg-secondary text-secondary-foreground uppercase">
              {monitor.method}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {monitor.name}
            </h1>
            <StatusBadge status={monitor.status} />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>{monitor.url}</span>
            <button
              type="button"
              onClick={() => handleCopyUrl(monitor.url)}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
              title="Copy URL"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <span className="text-muted-foreground/40">·</span>
            <span>Interval: Every {monitor.intervalSeconds}s</span>
            <span className="text-muted-foreground/40">·</span>
            <span>Timeout: {monitor.timeoutMs}ms</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <a
            href={monitorApi.getExportUrl(monitor.id)}
            download
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 text-xs h-8.5"
            )}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualCheck}
            disabled={isChecking || monitor.status === "PAUSED"}
            className="gap-1.5 text-xs h-8.5"
          >
            {isChecking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            <span>Check Now</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePause}
            className="gap-1.5 text-xs h-8.5"
          >
            {monitor.status === "PAUSED" ? (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-500" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-500" />
                <span>Pause</span>
              </>
            )}
          </Button>

          <ConfirmDialog
            title="Delete Monitor?"
            description={`Are you sure you want to permanently delete "${monitor.name}"? This action cannot be undone.`}
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={handleDelete}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8.5 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-border transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Uptime Percentage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {monitor.uptimePercentage ?? 100}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across rolling check history
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-border transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mean Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-foreground">
              {monitor.avgLatencyMs ? `${monitor.avgLatencyMs}` : "—"}
              {monitor.avgLatencyMs && <span className="text-base font-normal text-muted-foreground ml-1">ms</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Arithmetic average response time
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-border transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              P95 Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-foreground">
              {monitor.p95LatencyMs ? `${monitor.p95LatencyMs}` : "—"}
              {monitor.p95LatencyMs && <span className="text-base font-normal text-muted-foreground ml-1">ms</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              95th percentile worst-case
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-border transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Last Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold truncate mt-1 text-foreground">
              {monitor.lastCheckedAt
                ? new Date(monitor.lastCheckedAt).toLocaleTimeString()
                : "Awaiting first probe"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target response validated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latency History Chart */}
      <Card>
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Response Time History
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Latency measurements across recent automated checks
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Real-time Latency (ms)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              Awaiting check execution data to render trend chart...
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" vertical={false} />
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
                    tickFormatter={(v) => `${v}ms`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1">
                            <p className="font-semibold text-foreground">Time: {label}</p>
                            <p className="text-blue-500 font-mono">Latency: {payload[0].value} ms</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#detailGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check History Table */}
      <Card>
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle className="text-base font-semibold">
            Execution Audit Log
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Log of checks executed by the background monitoring engine
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {history.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No checks recorded yet. Checks will appear here as the worker processes them.
            </div>
          ) : (
            <div className="rounded-md border border-border/80 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b border-border/80">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider py-3">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider py-3">HTTP Code</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider py-3">Latency</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider py-3">Failure Reason</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider py-3">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((check) => (
                    <TableRow key={check.id} className="border-b border-border/60 hover:bg-muted/40 transition-colors">
                      <TableCell className="py-2.5">
                        <StatusBadge status={check.status === "SUCCESS" ? "UP" : "DOWN"} />
                      </TableCell>
                      <TableCell className="py-2.5 font-mono text-xs">
                        {check.httpStatus ? (
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded font-semibold text-[11px]",
                              check.httpStatus >= 200 && check.httpStatus < 300
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {check.httpStatus}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="py-2.5 font-mono text-xs font-medium">
                        {check.responseTimeMs ?? 0} ms
                      </TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground max-w-xs truncate">
                        {check.failureReason || "—"}
                      </TableCell>
                      <TableCell className="text-right py-2.5 font-mono text-xs text-muted-foreground">
                        {new Date(check.checkedAt).toLocaleString()}
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
