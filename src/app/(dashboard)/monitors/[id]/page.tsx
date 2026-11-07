import React, { Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";

export default function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<MonitorDetailSkeleton />}>
      <MonitorDetailContent params={params} />
    </Suspense>
  );
}

function MonitorDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}

async function MonitorDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
        <span className="font-mono text-xs">{id}</span>
      </div>

      {/* Header Panel with Quick Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Production Auth Service
            </h1>
            <StatusBadge status="UP" />
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            GET https://auth.example.com/health • Interval: 60s
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Check Now
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Pause
          </Button>
          <Button variant="destructive" size="sm" className="gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
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
              100.0%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              1,440 checks evaluated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Avg Latency (24 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94 ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              p95 response time: 132 ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Last Incident
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              None
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Zero downtime past 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latency History Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Response Time Trend
          </CardTitle>
          <CardDescription className="text-xs">
            Measured round-trip latency over recent checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed bg-muted/20 text-xs text-muted-foreground font-mono">
            [Recharts AreaChart Placeholder — Wired in Phase 5]
          </div>
        </CardContent>
      </Card>

      {/* Recent Checks History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Recent Check History
          </CardTitle>
          <CardDescription className="text-xs">
            Inspection logs recorded by the background monitoring engine
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead>HTTP Status</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Checked At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  status: "SUCCESS" as const,
                  http: 200,
                  latency: "88 ms",
                  time: "10s ago",
                },
                {
                  status: "SUCCESS" as const,
                  http: 200,
                  latency: "94 ms",
                  time: "1m ago",
                },
                {
                  status: "SUCCESS" as const,
                  http: 200,
                  latency: "102 ms",
                  time: "2m ago",
                },
              ].map((c, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      SUCCESS
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm font-semibold">
                    {c.http} OK
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {c.latency}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
