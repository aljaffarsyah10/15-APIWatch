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
import { monitorApi, type CreateMonitorPayload } from "../api";
import { getErrorMessage } from "@/lib/api/error";

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
      name: initialData?.name || "",
      url: initialData?.url || "",
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

    try {
      // Parse status codes string: e.g. "200, 201" -> [200, 201]
      const expectedStatusCodes = data.expectedStatusCodes
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));

      // Parse request headers if provided
      let requestHeaders: Record<string, string> | undefined;
      if (data.requestHeaders?.trim()) {
        try {
          requestHeaders = JSON.parse(data.requestHeaders.trim());
        } catch {
          // If not valid JSON, parse line-by-line "Header: Value"
          requestHeaders = {};
          data.requestHeaders.split("\n").forEach((line) => {
            const [k, ...v] = line.split(":");
            if (k && v.length) {
              requestHeaders![k.trim()] = v.join(":").trim();
            }
          });
        }
      }

      const payload: CreateMonitorPayload = {
        name: data.name,
        url: data.url,
        method: data.method,
        intervalSeconds: data.intervalSeconds,
        timeoutMs: data.timeoutMs,
        expectedStatusCodes: expectedStatusCodes.length ? expectedStatusCodes : [200],
        requestHeaders,
        requestBody: isBodyAllowed && data.requestBody?.trim() ? data.requestBody : undefined,
        bodyValidation: data.bodyMatch?.trim()
          ? {
              type: "contains",
              target: data.bodyMatch.trim(),
            }
          : undefined,
      };

      if (isEditing && initialData?.id) {
        await monitorApi.update(initialData.id, payload);
        toast.success("Monitor updated successfully", {
          description: `Changes saved for "${data.name}"`,
        });
      } else {
        await monitorApi.create(payload);
        toast.success("Monitor created successfully", {
          description: `Scheduled check for "${data.name}" every ${data.intervalSeconds}s`,
        });
      }

      router.push("/monitors");
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        isEditing ? "Failed to update monitor" : "Failed to create monitor",
        {
          description: getErrorMessage(err),
        }
      );
    } finally {
      setIsSubmitting(false);
    }
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
                placeholder="e.g. Production Billing API Health"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="url">Target Endpoint URL</Label>
              <Input
                id="url"
                placeholder="https://api.yourdomain.com/health"
                {...register("url")}
              />
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <ShieldAlert className="h-3 w-3 text-amber-500" />
                SSRF protected: private IPs, localhost, and cloud metadata endpoints are strictly blocked.
              </p>
              {errors.url && (
                <p className="text-xs text-rose-500">{errors.url.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="method">HTTP Method</Label>
                <select
                  id="method"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("method")}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                  <option value="HEAD">HEAD</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="intervalSeconds">Check Frequency</Label>
                <select
                  id="intervalSeconds"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("intervalSeconds", { valueAsNumber: true })}
                >
                  <option value={60}>Every 1 minute (60s)</option>
                  <option value={120}>Every 2 minutes (120s)</option>
                  <option value={300}>Every 5 minutes (300s)</option>
                  <option value={600}>Every 10 minutes (600s)</option>
                </select>
                {errors.intervalSeconds && (
                  <p className="text-xs text-rose-500">
                    {errors.intervalSeconds.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="timeoutMs">Timeout Limit</Label>
                <select
                  id="timeoutMs"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("timeoutMs", { valueAsNumber: true })}
                >
                  <option value={5000}>5 seconds (5000ms)</option>
                  <option value={10000}>10 seconds (10000ms)</option>
                  <option value={15000}>15 seconds (15000ms)</option>
                  <option value={30000}>30 seconds (30000ms)</option>
                </select>
                {errors.timeoutMs && (
                  <p className="text-xs text-rose-500">
                    {errors.timeoutMs.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Validation Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              2. Validation & Assertions
            </CardTitle>
            <CardDescription className="text-xs">
              Define the conditions required for a check to be marked as operational (UP)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="expectedStatusCodes">
                Expected HTTP Status Codes
              </Label>
              <Input
                id="expectedStatusCodes"
                placeholder="200, 201, 204"
                {...register("expectedStatusCodes")}
              />
              <p className="text-[11px] text-muted-foreground">
                Comma-separated HTTP status codes considered healthy
              </p>
              {errors.expectedStatusCodes && (
                <p className="text-xs text-rose-500">
                  {errors.expectedStatusCodes.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bodyMatch">Response Body Match (Optional)</Label>
              <Input
                id="bodyMatch"
                placeholder='e.g. "status":"ok" or healthy'
                {...register("bodyMatch")}
              />
              <p className="text-[11px] text-muted-foreground">
                Ensures the returned body contains this required substring
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Request Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              3. Request Payload & Headers
            </CardTitle>
            <CardDescription className="text-xs">
              Configure custom headers and request body (encrypted with AES-256-GCM at rest)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="requestHeaders">Custom Headers (JSON)</Label>
              <Textarea
                id="requestHeaders"
                placeholder='{"Authorization": "Bearer token123", "X-Custom-Header": "value"}'
                rows={3}
                className="font-mono text-xs"
                {...register("requestHeaders")}
              />
            </div>

            {isBodyAllowed && (
              <div className="space-y-1.5">
                <Label htmlFor="requestBody">Request Body (JSON or Plaintext)</Label>
                <Textarea
                  id="requestBody"
                  placeholder='{"query": "healthcheck"}'
                  rows={4}
                  className="font-mono text-xs"
                  {...register("requestBody")}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
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
              : "Create Monitor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
