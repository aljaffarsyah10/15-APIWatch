"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export function MonitorListTable() {
  const [monitors, setMonitors] = useState<MonitorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");

  const displayedMonitors = monitors.filter((m) => {
    if (methodFilter !== "ALL" && m.method !== methodFilter) {
      return false;
    }
    return true;
  });

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
        description="Manage and monitor availability for all your production HTTP endpoints"
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search monitors by name or URL..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus:outline-none"
            aria-label="Filter by HTTP method"
          >
            <option value="ALL">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          {["ALL", "UP", "DOWN", "PAUSED"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="text-xs capitalize h-8"
            >
              {status.toLowerCase()}
            </Button>
          ))}
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
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Monitor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Interval</TableHead>
                <TableHead className="hidden lg:table-cell">Avg Latency</TableHead>
                <TableHead className="hidden sm:table-cell">Last Checked</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedMonitors.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono px-1 py-0">
                          {m.method}
                        </Badge>
                        <Link
                          href={`/monitors/${m.id}`}
                          className="font-medium hover:underline flex items-center gap-1"
                        >
                          {m.name}
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-50" />
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-xs md:max-w-md">
                        {m.url}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    Every {m.intervalSeconds}s
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">
                    {m.lastResponseTimeMs ? `${m.lastResponseTimeMs} ms` : "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {m.lastCheckedAt ? new Date(m.lastCheckedAt).toLocaleTimeString() : "Pending"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={
                            <Link href={`/monitors/${m.id}`} className="cursor-pointer flex items-center w-full">
                              View Details
                            </Link>
                          }
                        />
                        <DropdownMenuItem
                          onClick={() => handleTogglePause(m.id, m.status)}
                          className="cursor-pointer"
                        >
                          {m.status === "PAUSED" ? (
                            <>
                              <Play className="mr-2 h-4 w-4 text-emerald-500" />
                              <span>Resume Monitor</span>
                            </>
                          ) : (
                            <>
                              <Pause className="mr-2 h-4 w-4 text-amber-500" />
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
                              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors hover:bg-accent text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950 w-full"
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
