"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function InteractiveAssertionTester() {
  const [latencyThreshold, setLatencyThreshold] = useState(150);
  const [checkStatus, setCheckStatus] = useState(true);
  const [checkJsonBody, setCheckJsonBody] = useState(true);
  const [checkHeader, setCheckHeader] = useState(true);

  // Simulated current response latency
  const currentSimulatedLatency = 118;
  const isLatencyFailed = currentSimulatedLatency > latencyThreshold;
  const isAllPassed = !isLatencyFailed && checkStatus && checkJsonBody && checkHeader;

  return (
    <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-blue-500/5 p-6 sm:p-8 shadow-sm backdrop-blur-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 font-mono">
            <Sliders className="h-3.5 w-3.5" />
            Interactive Rule Simulator
          </div>
          <h3 className="text-xl font-extrabold text-foreground tracking-tight">
            Try Multi-Rule Assertion Testing
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Adjust the response threshold slider or toggle rules below to see how APIWatch detects performance regressions.
          </p>
        </div>

        <div>
          {isAllPassed ? (
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 px-3 py-1 font-mono text-xs font-bold gap-1.5 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>ASSERTIONS PASSED (4/4)</span>
            </Badge>
          ) : (
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 px-3 py-1 font-mono text-xs font-bold gap-1.5 shadow-2xs">
              <AlertTriangle className="h-4 w-4 text-amber-500 animate-bounce" />
              <span>INCIDENT TRIGGERED</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Interactive Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-foreground">Max Allowed Latency Threshold</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {latencyThreshold}ms
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={latencyThreshold}
              onChange={(e) => setLatencyThreshold(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-muted rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>50ms (Strict SLA)</span>
              <span>150ms (Standard)</span>
              <span>300ms (Relaxed)</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-foreground">Active Assertion Criteria</span>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer p-2.5 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  checked={checkStatus}
                  onChange={(e) => setCheckStatus(e.target.checked)}
                  className="rounded accent-blue-600"
                />
                <span className="text-foreground font-mono">Status Code === 200</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer p-2.5 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  checked={checkJsonBody}
                  onChange={(e) => setCheckJsonBody(e.target.checked)}
                  className="rounded accent-blue-600"
                />
                <span className="text-foreground font-mono">JSON Body &apos;success&apos; === true</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer p-2.5 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  checked={checkHeader}
                  onChange={(e) => setCheckHeader(e.target.checked)}
                  className="rounded accent-blue-600"
                />
                <span className="text-foreground font-mono">Header &apos;content-type&apos; contains &apos;json&apos;</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Real-time Evaluation Outcome Card */}
        <div className={`rounded-xl border p-5 flex flex-col justify-between transition-all duration-300 ${
          isAllPassed
            ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
            : "border-amber-500/40 bg-amber-500/5 text-foreground"
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-bold border-b border-border/50 pb-2 mb-3">
              <span>LIVE TELEMETRY RESULT</span>
              <span className="font-mono text-[11px] text-muted-foreground">endpoint: /v1/checkout</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Measured Latency:</span>
                <span className={`font-bold ${isLatencyFailed ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                  {currentSimulatedLatency}ms {isLatencyFailed ? `(exceeds ${latencyThreshold}ms limit)` : "✓ Passed"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">HTTP Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">200 OK ✓</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payload Key Check:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">&#123;&quot;success&quot;: true&#125; ✓</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Content-Type Check:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">application/json ✓</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border/50 text-xs">
            {isAllPassed ? (
              <p className="text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                All rules healthy. BullMQ worker registers clean check.
              </p>
            ) : (
              <p className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                SLA Violation: Deduplicated incident queued for instant notification dispatch!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}