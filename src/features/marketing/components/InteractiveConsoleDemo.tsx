"use client";

import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EndpointPreset {
  id: string;
  name: string;
  method: "GET" | "POST";
  url: string;
  cluster: string;
  interval: string;
  defaultLatency: number;
  statusCode: number;
  statusText: string;
  assertions: string[];
  headers: Record<string, string>;
}

const PRESETS: EndpointPreset[] = [
  {
    id: "stripe",
    name: "Stripe Charges API",
    method: "GET",
    url: "https://api.stripe.com/v1/charges",
    cluster: "worker-us-east-1",
    interval: "30s",
    defaultLatency: 78,
    statusCode: 200,
    statusText: "OK",
    assertions: [
      "HTTP Status === 200",
      "Response Time < 200ms",
      "Header 'content-type' contains 'application/json'",
    ],
    headers: {
      Authorization: "Bearer sk_live_••••••••••••••••",
      "Stripe-Version": "2024-06-20",
      "X-Secret-Vault": "AES-256-GCM (Encrypted)",
    },
  },
  {
    id: "auth0",
    name: "Auth0 JWT OAuth",
    method: "POST",
    url: "https://auth.acme.corp/oauth/token",
    cluster: "worker-eu-west-1",
    interval: "60s",
    defaultLatency: 114,
    statusCode: 200,
    statusText: "OK",
    assertions: [
      "HTTP Status === 200",
      "Body token_type === 'Bearer'",
      "SSL Certificate Valid (> 30d)",
    ],
    headers: {
      Authorization: "Basic Y2xpZW50X2lkOnNlY3JldA==",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-SSRF-Shield": "Passed (RFC-1918 Block Active)",
    },
  },
  {
    id: "webhook",
    name: "Checkout Webhook",
    method: "POST",
    url: "https://api.store.com/webhooks/order",
    cluster: "worker-ap-southeast-1",
    interval: "30s",
    defaultLatency: 52,
    statusCode: 201,
    statusText: "Created",
    assertions: [
      "HTTP Status === 201",
      "Response Body contains 'event_id'",
      "Deduplication Window: 15m Cooldown",
    ],
    headers: {
      "X-Webhook-Signature": "sha256=••••••••••••••••",
      "Content-Type": "application/json",
      "X-Idempotency-Key": "idemp_9941a8bc",
    },
  },
];

export function InteractiveConsoleDemo() {
  const [selectedId, setSelectedId] = useState<string>("stripe");
  const [activeTab, setActiveTab] = useState<"feed" | "headers" | "assertions">("feed");
  const [isProbing, setIsProbing] = useState(false);
  const [probeCount, setProbeCount] = useState(1);
  const [hoveredTick, setHoveredTick] = useState<number | null>(null);

  const currentPreset = PRESETS.find((p) => p.id === selectedId) || PRESETS[0];

  // Dynamic jitter calculation on simulated probe run
  const [currentLatency, setCurrentLatency] = useState<number>(currentPreset.defaultLatency);

  const handleSelectPreset = (preset: EndpointPreset) => {
    setSelectedId(preset.id);
    setCurrentLatency(preset.defaultLatency);
  };

  const handleSimulateProbe = () => {
    if (isProbing) return;
    setIsProbing(true);
    setTimeout(() => {
      // Simulate slight variation in latency (±8ms)
      const variance = Math.floor(Math.random() * 16) - 8;
      const newLatency = Math.max(28, currentPreset.defaultLatency + variance);
      setCurrentLatency(newLatency);
      setProbeCount((prev) => prev + 1);
      setIsProbing(false);
    }, 700);
  };

  return (
    <div className="mt-14 mx-auto max-w-4xl relative group">
      {/* Dynamic Backlight Glow with Subtle Shimmer */}
      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-blue-600/35 via-indigo-600/30 to-teal-500/35 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden card-elevated">
        {/* Top Accent Gradient Hairline */}
        <div className="h-[3px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400" />

        {/* Console Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-border/70 px-4 py-3 bg-muted/40 gap-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs font-semibold text-foreground/85 flex items-center gap-1.5">
              apiwatch.telemetry.daemon // live-interactive
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10 text-[11px] font-mono py-0.5 font-bold gap-1 shadow-2xs"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Probes Dispatched: {probeCount * 14}</span>
            </Badge>

            <button
              onClick={handleSimulateProbe}
              disabled={isProbing}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`h-3 w-3 ${isProbing ? "animate-spin" : ""}`} />
              <span>{isProbing ? "Testing..." : "Test Probe Now"}</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Tabs */}
        <div className="border-b border-border/70 px-4 py-2.5 bg-background/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-bold text-muted-foreground mr-1 uppercase font-mono">
              PRESET:
            </span>
            {PRESETS.map((preset) => {
              const isSelected = preset.id === selectedId;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono">
            <button
              onClick={() => setActiveTab("feed")}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                activeTab === "feed"
                  ? "bg-foreground/10 text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Telemetry
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab("headers")}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                activeTab === "headers"
                  ? "bg-foreground/10 text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Headers
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab("assertions")}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                activeTab === "assertions"
                  ? "bg-foreground/10 text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Assertions ({currentPreset.assertions.length})
            </button>
          </div>
        </div>

        {/* Console Main Body Area */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Main Feed Tab */}
          {activeTab === "feed" && (
            <div className="rounded-xl border border-border/70 bg-background/80 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  {currentPreset.method}
                </span>
                <div>
                  <div className="font-mono text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                    {currentPreset.url}
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2 mt-0.5">
                    <span>Cluster: {currentPreset.cluster}</span>
                    <span>·</span>
                    <span>Interval: {currentPreset.interval}</span>
                    <span>·</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      TLS 1.3 Valid
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {currentPreset.statusCode} {currentPreset.statusText}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    monotonic:{" "}
                    <span className="text-foreground font-bold">{currentLatency}ms</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Headers Tab */}
          {activeTab === "headers" && (
            <div className="rounded-xl border border-border/70 bg-background/80 p-4 font-mono text-xs space-y-2 shadow-2xs">
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5 text-[11px] text-muted-foreground font-bold">
                <span>HEADER KEY</span>
                <span>RESOLVED VALUE (ENCRYPTED ENCLAVE)</span>
              </div>
              {Object.entries(currentPreset.headers).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{k}</span>
                  <span className="text-foreground/90 font-mono text-[11px] flex items-center gap-1">
                    {v.includes("AES-256") && <Lock className="h-3 w-3 text-emerald-500" />}
                    {v}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Assertions Tab */}
          {activeTab === "assertions" && (
            <div className="rounded-xl border border-border/70 bg-background/80 p-4 font-mono text-xs space-y-2 shadow-2xs">
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5 text-[11px] text-muted-foreground font-bold">
                <span>CRITICAL ASSERTION CRITERIA</span>
                <span>STATUS</span>
              </div>
              {currentPreset.assertions.map((rule, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-foreground font-medium">{rule}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Passed
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Interactive 30-Day Uptime Bar Visualization */}
          <div className="space-y-2 rounded-xl border border-border/70 bg-background/50 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">30-Day Rolling Uptime Ratio</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                100.0% Uptime
              </span>
            </div>

            {/* Visual Bar of Ticks with interactive hover tooltip */}
            <div className="flex items-center gap-1 h-6 w-full pt-1">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredTick(i + 1)}
                  onMouseLeave={() => setHoveredTick(null)}
                  className="flex-1 h-5 rounded-xs bg-emerald-500 hover:bg-emerald-400 hover:scale-y-125 transition-all cursor-pointer relative"
                />
              ))}
            </div>

            {/* Hover Tooltip / Status Display */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-0.5">
              <span>30 days ago</span>
              {hoveredTick !== null ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Day {hoveredTick}: 100% Uptime · {Math.max(45, currentLatency - (hoveredTick % 7))}ms avg · 2,880 Probes
                </span>
              ) : (
                <span className="text-muted-foreground font-medium">
                  Hover bars for daily incident &amp; latency report
                </span>
              )}
              <span>Today</span>
            </div>
          </div>

          {/* 3 Vibrant Stat Cards */}
          <div className="grid gap-3.5 sm:grid-cols-3 pt-1">
            <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 via-emerald-500/5 to-card p-4 shadow-2xs card-elevated">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>SYSTEM UPTIME</span>
                <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                99.99%
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-medium">
                Zero outage recorded in 30d
              </p>
            </div>

            <div className="rounded-xl border border-blue-500/25 bg-gradient-to-br from-blue-500/12 via-blue-500/5 to-card p-4 shadow-2xs card-elevated">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>MONOTONIC LATENCY</span>
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-2 text-2xl font-extrabold font-mono text-foreground">
                {currentLatency}ms
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-medium">
                Sub-millisecond resolution timer
              </p>
            </div>

            <div className="rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-500/12 via-purple-500/5 to-card p-4 shadow-2xs card-elevated">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>SECURITY ENCLAVE</span>
                <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="mt-2 text-2xl font-extrabold font-mono text-foreground">
                AES-256-GCM
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-medium">
                SSRF Guard &amp; Vault Secrets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}