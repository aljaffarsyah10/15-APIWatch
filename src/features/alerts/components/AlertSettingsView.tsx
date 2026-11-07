"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bell,
  Mail,
  Plus,
  Trash2,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { MOCK_ALERT_CHANNELS } from "../mocks";
import { alertChannelSchema, type AlertChannelFormData } from "../schemas";
import type { AlertChannelItem } from "../types";

export function AlertSettingsView() {
  const [channels, setChannels] = useState<AlertChannelItem[]>(MOCK_ALERT_CHANNELS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AlertChannelFormData>({
    resolver: zodResolver(alertChannelSchema),
    defaultValues: {
      name: "",
      type: "EMAIL",
      destination: "",
      secret: "",
    },
  });

  const selectedType = watch("type");

  const handleToggleChannel = (id: string, currentEnabled: boolean) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isEnabled: !currentEnabled } : c))
    );
    toast.success(
      !currentEnabled ? "Channel enabled" : "Channel disabled",
      {
        description: `Alert notifications updated for channel ${id}`,
      }
    );
  };

  const handleDeleteChannel = (id: string, name: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== id));
    toast.success("Channel deleted", {
      description: `Removed "${name}" from notification destinations`,
    });
  };

  const onSubmit = (data: AlertChannelFormData) => {
    const newChan: AlertChannelItem = {
      id: `chan-${Date.now()}`,
      name: data.name,
      type: data.type,
      destination: data.destination,
      secretMasked: data.secret ? "••••••••••••" : undefined,
      isEnabled: true,
      deliveredEventsCount: 0,
    };

    setChannels((prev) => [newChan, ...prev]);
    setIsDialogOpen(false);
    reset();
    toast.success("Alert channel created", {
      description: `Target "${data.name}" added successfully (Demo Mode)`,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Alert Channels"
        description="Configure automated notifications for endpoint downtime and recovery"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Channel
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Alert Channel</DialogTitle>
              <DialogDescription className="text-xs">
                Receive notifications when an endpoint goes down or recovers
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="chan-name">Channel Name</Label>
                <Input
                  id="chan-name"
                  placeholder="e.g. DevOps On-Call Team"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="chan-type">Channel Type</Label>
                <select
                  id="chan-type"
                  {...register("type")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="EMAIL">Email (SMTP)</option>
                  <option value="WEBHOOK">Webhook (HTTP POST)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="chan-dest">
                  {selectedType === "EMAIL" ? "Email Address" : "Webhook URL"}
                </Label>
                <Input
                  id="chan-dest"
                  placeholder={
                    selectedType === "EMAIL"
                      ? "alerts@example.com"
                      : "https://hooks.slack.com/services/..."
                  }
                  {...register("destination")}
                />
                {errors.destination && (
                  <p className="text-xs text-rose-500">
                    {errors.destination.message}
                  </p>
                )}
              </div>

              {selectedType === "WEBHOOK" && (
                <div className="space-y-1.5">
                  <Label htmlFor="chan-secret">Signing Secret (Optional)</Label>
                  <Input
                    id="chan-secret"
                    type="password"
                    placeholder="whsec_..."
                    {...register("secret")}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Stored securely using AES-256-GCM encryption.
                  </p>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Channel</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Tabs */}
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
          Alerts are dispatched when an endpoint transitions from UP to DOWN, and
          once more upon recovery. Ongoing downtime checks will not spam your
          inbox or webhook channels.
        </p>
      </div>

      {/* Channels List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {channels.map((ch) => (
          <Card key={ch.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {ch.type === "EMAIL" ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <Webhook className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {ch.name}
                    </CardTitle>
                    <span className="text-[11px] text-muted-foreground">
                      {ch.type === "EMAIL" ? "SMTP Notification" : "HTTP POST Payload"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      ch.isEnabled
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
                        : "bg-muted text-muted-foreground text-xs"
                    }
                  >
                    {ch.isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={ch.isEnabled}
                    onCheckedChange={() =>
                      handleToggleChannel(ch.id, ch.isEnabled)
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <span className="text-muted-foreground block">Destination:</span>
              <span className="font-mono font-medium text-foreground truncate block">
                {ch.destination}
              </span>
              {ch.secretMasked && (
                <span className="text-[11px] text-muted-foreground font-mono block">
                  Secret: {ch.secretMasked}
                </span>
              )}
            </CardContent>
            <CardFooter className="border-t pt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Delivered: {ch.deliveredEventsCount} events</span>
              <ConfirmDialog
                title="Delete Alert Channel?"
                description={`Are you sure you want to delete "${ch.name}"? You will stop receiving alerts at ${ch.destination}.`}
                confirmLabel="Delete Channel"
                onConfirm={() => handleDeleteChannel(ch.id, ch.name)}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                }
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
