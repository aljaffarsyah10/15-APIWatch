"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Mail,
  Plus,
  RefreshCw,
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

  const handleDeleteChannel = async (id: string, name: string) => {
    try {
      await alertApi.delete(id);
      setChannels((prev) => prev.filter((c) => c.id !== id));
      toast.success("Channel deleted", {
        description: `Removed "${name || "Channel"}"`,
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
      await alertApi.create({
        type: data.type,
        destination: data.destination,
        secret: data.secret || undefined,
        isEnabled: true,
      });

      setIsDialogOpen(false);
      reset();
      toast.success("Alert channel created", {
        description: `Target "${data.destination}" added successfully`,
      });
      reloadChannels();
    } catch (err: unknown) {
      toast.error("Failed to create alert channel", {
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
        description="Configure notification destinations for automated downtime alerts and recovery events"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reloadChannels}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
            />
            <span>Refresh</span>
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Channel
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Alert Channel</DialogTitle>
                <DialogDescription className="text-xs">
                  Choose where to receive downtime alerts when an endpoint fails
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="type">Channel Type</Label>
                  <select
                    id="type"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...register("type")}
                  >
                    <option value="EMAIL">Email Address (SMTP)</option>
                    <option value="WEBHOOK">Webhook (HTTP POST)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="destination">
                    {selectedType === "EMAIL" ? "Recipient Email" : "Webhook URL"}
                  </Label>
                  <Input
                    id="destination"
                    placeholder={
                      selectedType === "EMAIL"
                        ? "alerts@yourcompany.com"
                        : "https://api.yourdomain.com/webhooks/apiwatch"
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
                    <Label htmlFor="secret">
                      Signing Secret (Optional, for HMAC SHA-256)
                    </Label>
                    <Input
                      id="secret"
                      type="password"
                      placeholder="webhook_secret_key"
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
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
        <div className="grid gap-4">
          {channels.map((channel) => (
            <Card key={channel.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {channel.type === "EMAIL" ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <Webhook className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {channel.type === "EMAIL" ? "Email Alert" : "Webhook Endpoint"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {channel.destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
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
              <CardContent className="pt-2">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">
                    {channel.type}
                  </Badge>
                  <span>•</span>
                  <span>
                    Triggers on status transition: UP → DOWN and recovery
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
