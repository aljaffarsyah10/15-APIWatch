import React from "react";
import Link from "next/link";
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
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">12</div>
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
              11
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              91.7% overall system health
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
              1
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              1 active incident detected
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
            <div className="text-2xl font-bold">142 ms</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
              12ms faster than yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Quick Monitor List */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Recent Monitors
                </CardTitle>
                <CardDescription className="text-xs">
                  Quick view of endpoints and their latest response time
                </CardDescription>
              </div>
              <Link
                href="/monitors"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-xs")}
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
                {
                  id: "mon-4",
                  name: "Notification Dispatcher",
                  url: "https://notify.example.com/status",
                  method: "GET",
                  status: "PAUSED" as const,
                  latency: "—",
                  checkedAt: "1h ago",
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

        {/* Right Column (1 Col): Incidents & Health Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Recent Incidents
              </CardTitle>
              <CardDescription className="text-xs">
                Log of downtime and recovery transitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    Payment Gateway Webhook
                  </span>
                  <span className="text-muted-foreground">1m ago</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  Failed: HTTP Check timed out after 10000ms.
                </p>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Product Catalog Search
                  </span>
                  <span className="text-muted-foreground">3h ago</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  Recovered: Endpoint returned HTTP 200 OK.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
