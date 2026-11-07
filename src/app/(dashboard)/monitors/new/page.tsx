import React from "react";
import Link from "next/link";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NewMonitorPage() {
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
        title="Add New Monitor"
        description="Configure automated availability checks and assertion criteria"
      />

      {/* Multi-Section Form Layout */}
      <form className="space-y-6">
        {/* Section 1: Basic Info */}
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
                defaultValue="Production API Health"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="sm:col-span-1 space-y-1.5">
                <Label htmlFor="method">HTTP Method</Label>
                <Input id="method" defaultValue="GET" readOnly className="font-mono" />
              </div>
              <div className="sm:col-span-3 space-y-1.5">
                <Label htmlFor="url">Endpoint URL</Label>
                <Input
                  id="url"
                  placeholder="https://api.example.com/health"
                  defaultValue="https://httpbin.org/status/200"
                  className="font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                  <ShieldAlert className="h-3 w-3 text-amber-500" />
                  Protected against SSRF: localhost and private IPs are blocked.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Expected Response */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              2. Expected Response & Assertions
            </CardTitle>
            <CardDescription className="text-xs">
              Criteria required for a check to be classified as successful (UP)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="statusCodes">Expected Status Codes</Label>
              <Input
                id="statusCodes"
                defaultValue="200"
                placeholder="Comma separated, e.g. 200, 201, 204"
                className="font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Any status code returned outside this list triggers a DOWN status.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bodyContains">Body Match (Optional)</Label>
              <Input
                id="bodyContains"
                placeholder="e.g. 'success' or 'healthy'"
                className="font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Substring that must be present in the response body.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Schedule & Timeout */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              3. Schedule & Timeout
            </CardTitle>
            <CardDescription className="text-xs">
              Worker polling frequency and request cancellation threshold
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="interval">Check Interval</Label>
              <Input
                id="interval"
                defaultValue="60 seconds (1 minute)"
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timeout">Request Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                defaultValue={10000}
                className="font-mono"
              />
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
          <Button type="button" className="gap-2">
            <Save className="h-4 w-4" />
            Save Monitor (UI Preview)
          </Button>
        </div>
      </form>
    </div>
  );
}
