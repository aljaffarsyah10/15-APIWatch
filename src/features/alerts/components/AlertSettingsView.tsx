"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
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
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { alertChannelSchema, type AlertChannelFormData } from "../schemas";
import { alertApi } from "../api";
import type { AlertChannelItem } from "../types";
import { getErrorMessage } from "@/lib/api/error";
import { cn } from "@/lib/utils";

export function AlertSettingsView() {
  const [channels, setChannels] = useState<AlertChannelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const reloadChannels = async () => {
    setIsRefreshing(true);
    try {
      const data = await alertApi.list();
      setChannels(data);
      setError(null);
      toast.success("Alert channels refreshed");
    } catch (err: unknown) {
      toast.error("Failed to fetch channels", {
        description: getErrorMessage(err),
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    alertApi
      .list()
      .then((data) => {
        if (isMounted) {
          setChannels(data);
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
  }, []);

  const handleToggleChannel = async (id: string, currentEnabled: boolean) => {
    try {
      await alertApi.update(id, { isEnabled: !currentEnabled });
      setChannels((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isEnabled: !currentEnabled } : c))
      );
      toast.success(!currentEnabled ? "Channel enabled" : "Channel disabled", {
        description: `Alert notifications updated`,
      });
    } catch (err: unknown) {
      toast.error("Failed to update channel", {
        description: getErrorMessage(err),
      });
    }
  };

  const handleDeleteChannel = async (id: string, destination: string) => {
    try {
      await alertApi.delete(id);
      setChannels((prev) => prev.filter((c) => c.id !== id));
      toast.success("Alert channel removed", {
        description: `Deleted "${destination}"`,
      });
    } catch (err: unknown) {
      toast.error("Failed to delete channel", {
        description: getErrorMessage(err),
      });
    }
  };

  const onSubmit = async (data: AlertChannelFormData) => {
    setIsSubmitting(true);
    try {
      const newChannel = await alertApi.create({
        type: data.type,
        destination: data.destination,
        secret: data.secret?.trim() ? data.secret.trim() : undefined,
      });

      setChannels((prev) => [newChannel, ...prev]);
      setIsDialogOpen(false);
      reset();
      toast.success("Alert channel added", {
        description: `Ready to dispatch incident alerts to ${data.destination}`,
      });
    } catch (err: unknown) {
      toast.error("Failed to add channel", {
        description: getErrorMessage(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Alert Channels"
        description="Configure automated notifications via SMTP Email and Custom Webhooks"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reloadChannels}
            disabled={isRefreshing}
            className="gap-1.5 h-8.5"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5 text-muted-foreground", isRefreshing && "animate-spin text-primary")}
            />
            <span>Refresh</span>
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5 h-8.5 shadow-2xs font-semibold">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Channel</span>
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Add Alert Channel</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Choose where to receive downtime alerts when an endpoint fails health checks
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-semibold">Channel Type</Label>
                  <select
                    id="type"
                    className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                    {...register("type")}
                  >
                    <option value="EMAIL">Email Address (SMTP)</option>
                    <option value="WEBHOOK">Webhook (HTTP POST)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="destination" className="text-xs font-semibold">
                    {selectedType === "EMAIL" ? "Recipient Email" : "Webhook URL"}
                  </Label>
                  <Input
                    id="destination"
                    placeholder={
                      selectedType === "EMAIL"
                        ? "alerts@yourcompany.com"
                        : "https://api.yourdomain.com/webhooks/apiwatch"
                    }
                    className="h-8.5 text-xs bg-card"
                    {...register("destination")}
                  />
                  {errors.destination && (
                    <p className="text-xs text-rose-500">{errors.destination.message}</p>
                  )}
                  {selectedType === "WEBHOOK" && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                      <ShieldAlert className="h-3 w-3 text-amber-500" />
                      SSRF protected: private IPs and cloud metadata are blocked.
                    </p>
                  )}
                </div>

                {selectedType === "WEBHOOK" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="secret" className="text-xs font-semibold">
                      Signing Secret (Optional HMAC SHA-256)
                    </Label>
                    <Input
                      id="secret"
                      type="password"
                      placeholder="webhook_secret_key"
                      className="h-8.5 text-xs bg-card"
                      {...register("secret")}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Included in the X-APIWatch-Signature header
                    </p>
                  </div>
                )}

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDialogOpen(false)}
                    className="h-8.5 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitting} className="h-8.5 text-xs font-semibold">
                    {isSubmitting && (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    )}
                    {isSubmitting ? "Adding..." : "Add Channel"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={2} />
      ) : error ? (
        <ErrorState
          title="Failed to Load Alert Channels"
          message={error}
          onRetry={() => {
            setIsLoading(true);
            reloadChannels();
          }}
        />
      ) : channels.length === 0 ? (
        <EmptyState
          title="No Alert Channels Configured"
          description="Add an email address or webhook endpoint to receive notifications when your monitors go DOWN."
          actionLabel="Add Alert Channel"
          onAction={() => setIsDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-3">
          {channels.map((channel) => (
            <Card key={channel.id} className="hover:border-border transition-colors">
              <CardHeader className="flex flex-row items-center justify-between py-3.5 px-4 space-y-0">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-md",
                      channel.type === "EMAIL"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    )}
                  >
                    {channel.type === "EMAIL" ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <Webhook className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span>{channel.type === "EMAIL" ? "Email Alert" : "Webhook Endpoint"}</span>
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border bg-secondary text-secondary-foreground">
                        {channel.type}
                      </span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {channel.destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                      {channel.isEnabled ? "Active" : "Disabled"}
                    </span>
                    <Switch
                      checked={channel.isEnabled}
                      onCheckedChange={() =>
                        handleToggleChannel(channel.id, channel.isEnabled)
                      }
                      aria-label="Toggle alert channel status"
                    />
                  </div>

                  <ConfirmDialog
                    title="Delete Alert Channel?"
                    description={`Are you sure you want to remove "${channel.destination}"? You will no longer receive alerts at this destination.`}
                    confirmLabel="Delete"
                    variant="destructive"
                    onConfirm={() =>
                      handleDeleteChannel(channel.id, channel.destination)
                    }
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
