"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  ExternalLink,
  MoreHorizontal,
  Pause,
  Play,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { monitorApi } from "../api";
import type { MonitorItem } from "../types";
import { getErrorMessage } from "@/lib/api/error";
import { cn } from "@/lib/utils";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
  PATCH: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30",
  DELETE: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
  HEAD: "bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30",
};

export function MonitorListTable() {
  const [monitors, setMonitors] = useState<MonitorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const displayedMonitors = monitors.filter((m) => {
    if (methodFilter !== "ALL" && m.method !== methodFilter) {
      return false;
    }
    return true;
  });

  const handleCopyUrl = (id: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await monitorApi.list({
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      setMonitors(res.monitors);
      setError(null);
      toast.success("Monitors list refreshed");
    } catch (err: unknown) {
      toast.error("Failed to fetch monitors", {
        description: getErrorMessage(err),
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    monitorApi
      .list({
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      })
      .then((res) => {
        if (isMounted) {
          setMonitors(res.monitors);
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
  }, [search, statusFilter]);

  const handleTogglePause = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === "PAUSED") {
        await monitorApi.resume(id);
        toast.success("Monitor resumed", {
          description: "Scheduled checks are now active again",
        });
      } else {
        await monitorApi.pause(id);
        toast.success("Monitor paused", {
          description: "Scheduled checks have been temporarily suspended",
        });
      }
      handleRefresh();
    } catch (err: unknown) {
      toast.error("Failed to update monitor status", {
        description: getErrorMessage(err),
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await monitorApi.delete(id);
      toast.success("Monitor deleted", {
        description: `Removed "${name}" from monitoring queue`,
      });
      handleRefresh();
    } catch (err: unknown) {
      toast.error("Failed to delete monitor", {
        description: getErrorMessage(err),
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitors"
        description="Continuous health checks, cadence configuration, and latency metrics"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5 h-8.5 bg-card"
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or URL..."
            className="pl-9 h-8.5 text-xs bg-card border-border/80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-8.5 rounded-md border border-border/80 bg-card px-2.5 text-xs font-semibold text-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Filter by HTTP method"
          >
            <option value="ALL">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          <div className="flex items-center p-0.5 rounded-lg bg-card/80 border border-border/80 shadow-2xs">
            {["ALL", "UP", "DOWN", "PAUSED"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                  statusFilter === status
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {status === "ALL" ? "All" : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <ErrorState
          title="Failed to Load Monitors"
          message={error}
          onRetry={() => {
            setIsLoading(true);
            handleRefresh();
          }}
        />
      ) : displayedMonitors.length === 0 ? (
        <EmptyState
          title={search || statusFilter !== "ALL" || methodFilter !== "ALL" ? "No matching monitors found" : "No Monitors Configured Yet"}
          description={
            search || statusFilter !== "ALL" || methodFilter !== "ALL"
              ? "Try adjusting your search keywords or filter criteria."
              : "Get started by adding your first endpoint monitor."
          }
          actionLabel={search || statusFilter !== "ALL" || methodFilter !== "ALL" ? undefined : "Add Your First Monitor"}
          onAction={search || statusFilter !== "ALL" || methodFilter !== "ALL" ? undefined : () => {}}
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs card-elevated">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border/80 hover:bg-transparent">
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3.5">Monitor</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3.5">Status</TableHead>
                <TableHead className="hidden md:table-cell text-xs font-bold uppercase tracking-wider text-muted-foreground py-3.5">Interval</TableHead>
                <TableHead className="hidden lg:table-cell text-xs font-bold uppercase tracking-wider text-muted-foreground py-3.5">Latency</TableHead>
                <TableHead className="hidden sm:table-cell text-xs font-bold uppercase tracking-wider text-muted-foreground py-3.5">Last Checked</TableHead>
                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground py-3.5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedMonitors.map((m) => (
                <TableRow
                  key={m.id}
                  className="border-b border-border/60 hover:bg-muted/30 transition-colors group"
                >
                  <TableCell className="py-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shadow-2xs",
                            METHOD_COLORS[m.method] || "bg-muted text-muted-foreground"
                          )}
                        >
                          {m.method}
                        </span>
                        <Link
                          href={`/monitors/${m.id}`}
                          className="font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 text-sm tracking-tight"
                        >
                          {m.name}
                          <ExternalLink className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                        <span className="truncate max-w-xs md:max-w-md">{m.url}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyUrl(m.id, m.url, e)}
                          className="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5"
                          title="Copy URL"
                        >
                          {copiedId === m.id ? (
                            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono py-3.5">
                    Every {m.intervalSeconds}s
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-3.5">
                    {m.lastResponseTimeMs ? (
                      <span
                        className={cn(
                          "text-xs font-mono font-bold px-2 py-0.5 rounded-full inline-block border",
                          m.lastResponseTimeMs < 200
                            ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/20"
                            : m.lastResponseTimeMs < 600
                            ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/20"
                            : "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/20"
                        )}
                      >
                        {m.lastResponseTimeMs} ms
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono py-3.5">
                    {m.lastCheckedAt ? new Date(m.lastCheckedAt).toLocaleTimeString() : "Pending"}
                  </TableCell>
                  <TableCell className="text-right py-3.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          render={
                            <Link href={`/monitors/${m.id}`} className="cursor-pointer flex items-center w-full text-xs font-medium">
                              View Telemetry
                            </Link>
                          }
                        />
                        <DropdownMenuItem
                          onClick={() => handleTogglePause(m.id, m.status)}
                          className="cursor-pointer text-xs font-medium"
                        >
                          {m.status === "PAUSED" ? (
                            <>
                              <Play className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                              <span>Resume Monitor</span>
                            </>
                          ) : (
                            <>
                              <Pause className="mr-2 h-3.5 w-3.5 text-amber-500" />
                              <span>Pause Monitor</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ConfirmDialog
                          title="Delete Monitor?"
                          description={`Are you sure you want to permanently delete "${m.name}"? All historical latency records will be lost.`}
                          confirmLabel="Delete"
                          variant="destructive"
                          onConfirm={() => handleDelete(m.id, m.name)}
                          trigger={
                            <button
                              type="button"
                              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors hover:bg-accent text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950 w-full font-medium"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </button>
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
