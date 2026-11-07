import React from "react";
import Link from "next/link";
import {
  Activity,
  MoreHorizontal,
  PlusCircle,
  Search,
  ExternalLink,
} from "lucide-react";
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
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

export default function MonitorsPage() {
  const monitors = [
    {
      id: "mon-1",
      name: "Authentication Microservice",
      url: "https://auth.example.com/api/health",
      method: "GET",
      interval: "1m",
      status: "UP" as const,
      responseTime: "84 ms",
      lastChecked: "45s ago",
    },
    {
      id: "mon-2",
      name: "Stripe Webhook Listener",
      url: "https://api.example.com/v1/webhooks/stripe",
      method: "POST",
      interval: "5m",
      status: "DOWN" as const,
      responseTime: "Timeout",
      lastChecked: "2m ago",
    },
    {
      id: "mon-3",
      name: "Elasticsearch Cluster Status",
      url: "https://es.internal.example.com/_cluster/health",
      method: "GET",
      interval: "1m",
      status: "UP" as const,
      responseTime: "142 ms",
      lastChecked: "1m ago",
    },
    {
      id: "mon-4",
      name: "Email Delivery API",
      url: "https://mail.example.com/v1/status",
      method: "GET",
      interval: "15m",
      status: "PAUSED" as const,
      responseTime: "—",
      lastChecked: "3h ago",
    },
  ];

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
          <Input placeholder="Search monitors by name or URL..." className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="font-medium text-xs">
            All (4)
          </Button>
          <Button variant="ghost" size="sm" className="font-medium text-xs text-muted-foreground">
            UP (2)
          </Button>
          <Button variant="ghost" size="sm" className="font-medium text-xs text-muted-foreground">
            DOWN (1)
          </Button>
          <Button variant="ghost" size="sm" className="font-medium text-xs text-muted-foreground">
            PAUSED (1)
          </Button>
        </div>
      </div>

      {/* Monitors Table */}
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
            {monitors.map((m) => (
              <TableRow key={m.id} className="hover:bg-muted/40 transition-colors">
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
                  {m.interval}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">
                  {m.responseTime}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {m.lastChecked}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/monitors/${m.id}`} className="cursor-pointer flex items-center gap-2" />}>
                        <ExternalLink className="h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href={`/monitors/${m.id}`} className="cursor-pointer flex items-center gap-2" />}>
                        <Activity className="h-4 w-4" />
                        <span>Pause / Resume</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem render={<button className="text-rose-600 dark:text-rose-400 cursor-pointer flex items-center gap-2 w-full" />}>
                        <span>Delete Monitor</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
