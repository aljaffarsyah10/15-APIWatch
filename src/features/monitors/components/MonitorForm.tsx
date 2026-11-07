"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { monitorFormSchema, type MonitorFormData } from "../schemas";

interface MonitorFormProps {
  initialData?: Partial<MonitorFormData> & { id?: string };
  isEditing?: boolean;
}

export function MonitorForm({ initialData, isEditing = false }: MonitorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MonitorFormData>({
    resolver: zodResolver(monitorFormSchema),
    defaultValues: {
      name: initialData?.name || "Production Health Endpoint",
      url: initialData?.url || "https://httpbin.org/status/200",
      method: initialData?.method || "GET",
      intervalSeconds: initialData?.intervalSeconds || 60,
      timeoutMs: initialData?.timeoutMs || 10000,
      expectedStatusCodes: initialData?.expectedStatusCodes || "200",
      requestHeaders: initialData?.requestHeaders || "",
      requestBody: initialData?.requestBody || "",
      bodyMatch: initialData?.bodyMatch || "",
    },
  });

  const selectedMethod = watch("method");
  const isBodyAllowed = ["POST", "PUT", "PATCH"].includes(selectedMethod);

  const onSubmit = async (data: MonitorFormData) => {
    setIsSubmitting(true);
    // Simulate UI processing
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);

    toast.success(
      isEditing ? "Monitor updated successfully" : "Monitor created successfully",
      {
        description: `Scheduled check for "${data.name}" every ${data.intervalSeconds}s (Frontend Demo)`,
      }
    );
    router.push("/monitors");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/monitors"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Monitors
        </Link>
      </div>

      <PageHeader
        title={isEditing ? "Edit Monitor" : "Add New Monitor"}
        description="Configure automated availability checks and assertion criteria"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              1. Basic Information
            </CardTitle>
            <CardDescription className="text-xs">
              General endpoint identification and target destination
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Monitor Name</Label>
              <Input
                id="name"
                placeholder="e.g. Production Authentication Service"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="sm:col-span-1 space-y-1.5">
                <Label htmlFor="method">HTTP Method</Label>
                <select
                  id="method"
                  {...register("method")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                  <option value="HEAD">HEAD</option>
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <Label htmlFor="url">Endpoint URL</Label>
                <Input
                  id="url"
                  placeholder="https://api.example.com/health"
                  className="font-mono text-sm"
                  {...register("url")}
                />
                {errors.url ? (
                  <p className="text-xs text-rose-500">{errors.url.message}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                    <ShieldAlert className="h-3 w-3 text-amber-500 shrink-0" />
                    Protected against SSRF: localhost and private IPs are blocked.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Request Configuration */}
        {isBodyAllowed && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                2. Request Configuration ({selectedMethod})
              </CardTitle>
              <CardDescription className="text-xs">
                Headers and payload sent by the worker when performing the check
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="requestHeaders">Custom Headers (JSON or Key: Value)</Label>
                <Textarea
                  id="requestHeaders"
                  placeholder='{"Authorization": "Bearer token", "X-Custom-Header": "value"}'
                  className="font-mono text-xs h-20"
                  {...register("requestHeaders")}
                />
                <p className="text-[11px] text-muted-foreground">
                  Sensitive authorization headers are encrypted with AES-256-GCM.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="requestBody">Request Body (JSON / Text)</Label>
                <Textarea
                  id="requestBody"
                  placeholder='{"status": "ping"}'
                  className="font-mono text-xs h-24"
                  {...register("requestBody")}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 3: Expected Response & Assertions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              3. Expected Response & Assertions
            </CardTitle>
            <CardDescription className="text-xs">
              Criteria required for a check to be classified as successful (UP)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="expectedStatusCodes">Expected Status Codes</Label>
              <Input
                id="expectedStatusCodes"
                placeholder="Comma separated: 200, 201, 204"
                className="font-mono text-sm"
                {...register("expectedStatusCodes")}
              />
              {errors.expectedStatusCodes && (
                <p className="text-xs text-rose-500">
                  {errors.expectedStatusCodes.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bodyMatch">Response Body Contains (Optional)</Label>
              <Input
                id="bodyMatch"
                placeholder="e.g. 'status': 'ok' or 'healthy'"
                className="font-mono text-sm"
                {...register("bodyMatch")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Schedule & Timeout */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              4. Schedule & Timeout
            </CardTitle>
            <CardDescription className="text-xs">
              Worker polling frequency and request cancellation threshold
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="intervalSeconds">Check Interval (Seconds)</Label>
              <select
                id="intervalSeconds"
                {...register("intervalSeconds", { valueAsNumber: true })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value={60}>Every 1 minute (60s)</option>
                <option value={300}>Every 5 minutes (300s)</option>
                <option value={900}>Every 15 minutes (900s)</option>
                <option value={1800}>Every 30 minutes (1800s)</option>
                <option value={3600}>Every 1 hour (3600s)</option>
              </select>
              {errors.intervalSeconds && (
                <p className="text-xs text-rose-500">
                  {errors.intervalSeconds.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timeoutMs">Timeout Threshold (Milliseconds)</Label>
              <Input
                id="timeoutMs"
                type="number"
                placeholder="10000"
                className="font-mono"
                {...register("timeoutMs", { valueAsNumber: true })}
              />
              {errors.timeoutMs && (
                <p className="text-xs text-rose-500">
                  {errors.timeoutMs.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/monitors"
            className={buttonVariants({ variant: "outline" })}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Update Monitor"
              : "Save Monitor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
