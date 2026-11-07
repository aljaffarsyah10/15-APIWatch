"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  MoreHorizontal,
  Pause,
  Play,
  PlusCircle,
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
import { PageHeader } from "@/components/shared/PageHeader";
import { MOCK_MONITORS } from "../mocks";
import type { MonitorItem } from "../types";
import { cn } from "@/lib/utils";

export function MonitorListTable() {
  const [monitors, setMonitors] = useState<MonitorItem[]>(MOCK_MONITORS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredMonitors = monitors.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.url.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTogglePause = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PAUSED" ? "UP" : "PAUSED";
    setMonitors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: nextStatus } : m))
    );
    toast.success(
      nextStatus === "PAUSED" ? "Monitor paused" : "Monitor resumed",
      {
        description: `Status updated for monitor ${id} (Demo Mode)`,
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    setMonitors((prev) => prev.filter((m) => m.id !== id));
    toast.success("Monitor deleted", {
      description: `Removed "${name}" from monitoring queue`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitors"
        description="Manage and monitor availability for all your production HTTP endpoints"
      >
        <Link
          href="/monitors/new"
          className={cn(buttonVariants(), "gap-2")}
        >
          <PlusCircle className="h-4 w-4" />
          Add Monitor
        </Link>
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "UP", "DOWN", "PAUSED"].map((tab) => (
            <Button
              key={tab}
              variant={statusFilter === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(tab)}
              className="text-xs h-8"
            >
              {tab === "ALL" ? `All (${monitors.length})` : tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Empty State when filter yields 0 results */}
      {filteredMonitors.length === 0 ? (
        <EmptyState
          title="No Matching Monitors"
          description={
            search
              ? `No monitors matching "${search}". Try adjusting your keywords.`
              : "No monitors found for this filter tab."
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setStatusFilter("ALL");
          }}
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead>Monitor / URL</TableHead>
                <TableHead className="w-[90px]">Method</TableHead>
                <TableHead className="w-[90px]">Interval</TableHead>
                <TableHead className="w-[120px] text-right">Latency</TableHead>
                <TableHead className="w-[120px] text-right">Checked</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMonitors.map((m) => (
                <TableRow
                  key={m.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col min-w-0">
                      <Link
                        href={`/monitors/${m.id}`}
                        className="font-medium text-sm hover:underline truncate"
                      >
                        {m.name}
                      </Link>
                      <span className="font-mono text-xs text-muted-foreground truncate">
                        {m.url}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {m.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {m.intervalSeconds}s
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {m.lastResponseTimeMs ? `${m.lastResponseTimeMs} ms` : "—"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {m.lastCheckedAt}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={
                            <Link
                              href={`/monitors/${m.id}`}
                              className="cursor-pointer flex items-center gap-2"
                            />
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleTogglePause(m.id, m.status)}
                          className="cursor-pointer flex items-center gap-2"
                        >
                          {m.status === "PAUSED" ? (
                            <>
                              <Play className="h-4 w-4 text-emerald-500" />
                              <span>Resume Monitor</span>
                            </>
                          ) : (
                            <>
                              <Pause className="h-4 w-4 text-amber-500" />
                              <span>Pause Monitor</span>
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <div className="p-1">
                          <ConfirmDialog
                            title="Delete Monitor?"
                            description={`Are you sure you want to delete "${m.name}"? This will permanently stop checks and delete all history logs.`}
                            confirmLabel="Delete Monitor"
                            onConfirm={() => handleDelete(m.id, m.name)}
                            trigger={
                              <button
                                type="button"
                                className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-md cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Monitor</span>
                              </button>
                            }
                          />
                        </div>
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
