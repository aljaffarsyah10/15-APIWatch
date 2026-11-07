import React from "react";
import Link from "next/link";
import { Bell, Mail, Plus, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";

export default function AlertsSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Alert Channels"
        description="Configure automated notifications for endpoint downtime and recovery"
      >
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Channel
        </Button>
      </PageHeader>

      <div className="flex gap-2 border-b pb-2 text-sm">
        <Link
          href="/settings"
          className="text-muted-foreground hover:text-foreground pb-2 transition-colors"
        >
          General
        </Link>
        <Link
          href="/settings/alerts"
          className="font-medium text-primary border-b-2 border-primary pb-2 -mb-2 ml-4"
        >
          Alert Channels
        </Link>
      </div>

      {/* Alert Policy Note */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <Bell className="h-4 w-4 text-blue-500" />
          Notification Policy: Deduplication Active
        </p>
        <p>
          Alerts are only dispatched when an endpoint transitions from UP to DOWN,
          and once more when it recovers back to UP. Duplicate alerts during persistent
          downtime are automatically suppressed.
        </p>
      </div>

      {/* Channel Cards List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Email Channel Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Primary Email
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground">
                    SMTP Notification
                  </span>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
              >
                Enabled
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs">
            <span className="text-muted-foreground block">Destination:</span>
            <span className="font-mono font-medium text-foreground">
              developer@example.com
            </span>
          </CardContent>
          <CardFooter className="border-t pt-3 flex justify-between text-xs text-muted-foreground">
            <span>Delivered: 12 events</span>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              Configure
            </Button>
          </CardFooter>
        </Card>

        {/* Webhook Channel Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Webhook className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Slack Incident Webhook
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground">
                    HTTP POST Payload
                  </span>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
              >
                Enabled
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs">
            <span className="text-muted-foreground block">Webhook URL:</span>
            <span className="font-mono font-medium text-foreground truncate block">
              https://hooks.slack.com/services/T00/B00/X00
            </span>
          </CardContent>
          <CardFooter className="border-t pt-3 flex justify-between text-xs text-muted-foreground">
            <span>Encrypted Secret: ●●●●●●</span>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              Configure
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
