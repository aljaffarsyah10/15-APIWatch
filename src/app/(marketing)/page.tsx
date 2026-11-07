import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Radio,
  ShieldCheck,
  Zap,
  Lock,
  ChevronRight,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col relative overflow-hidden selection:bg-blue-500/20 selection:text-blue-600">
      {/* Dynamic Ambient Background Glows & Grid Pattern */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
      >
        <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-500/20 via-blue-500/15 to-transparent blur-3xl dark:from-blue-600/15 dark:via-indigo-900/15 animate-pulse-subtle" />
        <div className="absolute top-1/4 -right-24 h-[550px] w-[550px] rounded-full bg-gradient-to-bl from-sky-400/20 via-teal-400/15 to-transparent blur-3xl dark:from-sky-700/12 dark:via-emerald-950/15" />
        <div className="absolute top-2/3 left-1/4 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-purple-400/15 via-pink-400/10 to-transparent blur-3xl dark:from-purple-900/10 dark:via-blue-950/15" />
        <div className="absolute inset-0 bg-tech-grid [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 dark:opacity-20" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border border-blue-500/30 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-teal-500/10 text-blue-700 dark:text-blue-300 mb-8 shadow-xs hover:border-blue-500/50 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Next-Gen High-Concurrency API Monitoring Engine</span>
              <ChevronRight className="h-3.5 w-3.5 text-blue-500" />
            </div>

            {/* Main Punchy Headline with Gradient Text */}
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl leading-[1.1]">
              Precision API Telemetry for{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
                Modern Engineering
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto font-medium">
              Eliminate downtime and latent regressions before your users notice. Validate HTTP status codes,
              monotonic latency, encrypted headers, and JSON payloads with millisecond precision.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-95"
              >
                <Zap className="h-4.5 w-4.5" />
                <span>Open Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/status"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold text-foreground bg-card/85 hover:bg-card border border-border/80 shadow-xs hover:border-border transition-all duration-200 active:scale-95 backdrop-blur-md"
              >
                <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span>Live Public Status</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Sub-minute BullMQ checks
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                AES-256-GCM secret encryption
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                RFC-1918 SSRF sandbox isolation
              </span>
            </div>
          </div>

          {/* Showstopper: Live Interactive Telemetry Console Mockup */}
          <div className="mt-14 mx-auto max-w-4xl relative">
            {/* Ambient Backlight Glow behind Mockup */}
            <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-blue-600/30 via-indigo-600/25 to-teal-500/30 blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />

            <div className="relative rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden card-elevated">
              {/* Top Accent Gradient Hairline */}
              <div className="h-[3px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400" />

              {/* Console Header Bar */}
              <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 bg-muted/40">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    apiwatch.telemetry.daemon // live-stream
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10 text-[11px] font-mono py-0 font-bold gap-1"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    All Probes Operational
                  </Badge>
                </div>
              </div>

              {/* Active Probe Real-time Feed Row */}
              <div className="p-5 sm:p-6 space-y-5">
                <div className="rounded-xl border border-border/70 bg-background/80 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                      GET
                    </span>
                    <div>
                      <div className="font-mono text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                        https://api.stripe.com/v1/health
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2 mt-0.5">
                        <span>Cluster: worker-us-east-1</span>
                        <span>·</span>
                        <span>Interval: 30s</span>
                        <span>·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">TLS 1.3 Valid</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        200 OK
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">monotonic: 78ms</div>
                    </div>
                  </div>
                </div>

                {/* 30-Day Uptime Bar Visualization */}
                <div className="space-y-2 rounded-xl border border-border/70 bg-background/50 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">30-Day Rolling Uptime Ratio</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">100.0% Uptime</span>
                  </div>
                  {/* Visual Bar of Ticks */}
                  <div className="flex items-center gap-1 h-6 w-full pt-1">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-5 rounded-xs bg-emerald-500 hover:bg-emerald-400 transition-colors cursor-pointer group relative"
                        title={`Day ${i + 1}: 100% Availability`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-0.5">
                    <span>30 days ago</span>
                    <span>Continuous Probes</span>
                    <span>Today</span>
                  </div>
                </div>

                {/* 3 Vibrant Stat Cards */}
                <div className="grid gap-3.5 sm:grid-cols-3 pt-1">
                  <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 via-emerald-500/5 to-card p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                      <span>SYSTEM UPTIME</span>
                      <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      99.98%
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground font-medium">
                      Zero outage in 30 days
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-500/25 bg-gradient-to-br from-blue-500/12 via-blue-500/5 to-card p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                      <span>AVG RESPONSE SPEED</span>
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="mt-2 text-2xl font-extrabold font-mono text-foreground">
                      78ms
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground font-medium">
                      High-resolution monotonic timer
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-500/12 via-purple-500/5 to-card p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                      <span>SECURITY ENCLAVE</span>
                      <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="mt-2 text-2xl font-extrabold font-mono text-foreground">
                      AES-256-GCM
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground font-medium">
                      SSRF Guard &amp; Encrypted Keys
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-20 border-t border-border/80 bg-background/60 backdrop-blur-xs">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 mb-3">
              ENTERPRISE CAPABILITIES
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Engineered for Critical Production Workloads
            </h2>
            <p className="mt-3 text-base text-muted-foreground font-medium">
              Everything modern engineering teams need to monitor mission-critical HTTP endpoints without alert fatigue or false alarms.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {/* Feature 1: Polling */}
            <Card className="card-elevated border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-card to-card hover:border-blue-500/40">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                    <Activity className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-blue-500/30 text-blue-700 dark:text-blue-300 bg-blue-500/5">
                    30s POLLING
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold">Sub-Minute Polling</CardTitle>
                <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                  Probing intervals from 30 seconds to 1 hour executed across Redis BullMQ distributed worker clusters with automatic retry backoff.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2: Assertions */}
            <Card className="card-elevated border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card hover:border-emerald-500/40">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/5">
                    DEEP RULES
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold">Multi-Rule Assertions</CardTitle>
                <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                  Validate expected HTTP status codes, response headers, and exact JSON key-value tokens to prevent silent logic regressions.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3: SSRF */}
            <Card className="card-elevated border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-card to-card hover:border-purple-500/40">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-purple-500/30 text-purple-700 dark:text-purple-300 bg-purple-500/5">
                    RFC 1918 FILTER
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold">SSRF &amp; Injection Shield</CardTitle>
                <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                  Strict network sandbox blocking loopback addresses, AWS/GCP cloud metadata, private IP ranges, and CSV formula injection.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4: Alerts */}
            <Card className="card-elevated border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card to-card hover:border-amber-500/40">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                    <Bell className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/5">
                    ZERO FATIGUE
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold">Deduplicated Alerting</CardTitle>
                <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                  Instant notifications via SMTP Email and Webhooks with intelligent suppression windows to avoid notification storms during prolonged outages.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5: Public Status */}
            <Card className="card-elevated border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-card hover:border-rose-500/40">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                    <Radio className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-rose-500/30 text-rose-700 dark:text-rose-300 bg-rose-500/5">
                    NEXT.JS 16 PPR
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold">Public Status Page</CardTitle>
                <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                  Zero-leakage, high-performance public dashboard pre-rendered with Partial Prerendering (PPR) for instant client delivery worldwide.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6: Encryption */}
            <Card className="card-elevated border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-card to-card hover:border-indigo-500/40">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-indigo-500/30 text-indigo-700 dark:text-indigo-300 bg-indigo-500/5">
                    GCM ENCRYPTED
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold">Encrypted Headers &amp; Secrets</CardTitle>
                <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                  Safely inject Bearer tokens and Authorization keys. All sensitive credentials are encrypted at rest using AES-256-GCM.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 3-Step Architecture Pipeline */}
      <section className="py-20 border-t border-border/80 bg-gradient-to-b from-card/40 via-background to-background">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              How APIWatch Works in 3 Steps
            </h2>
            <p className="mt-3 text-base text-muted-foreground font-medium">
              From zero configuration to enterprise-grade health telemetry in under two minutes.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-border/80 bg-card/85 p-6 shadow-xs backdrop-blur-md space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-mono font-bold text-sm shadow-xs">
                  01
                </span>
                <span className="font-extrabold text-base text-foreground">Configure Endpoint</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Provide your target URL, HTTP method, check interval, and custom encrypted headers or JSON body payload.
              </p>
              <div className="rounded-lg bg-muted/60 p-2.5 font-mono text-[11px] text-muted-foreground border border-border/50">
                POST /api/v1/auth<br/>
                Header: Bearer ••••••••<br/>
                Assert: status === 200
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-border/80 bg-card/85 p-6 shadow-xs backdrop-blur-md space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono font-bold text-sm shadow-xs">
                  02
                </span>
                <span className="font-extrabold text-base text-foreground">Continuous Probing</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                BullMQ distributed workers execute scheduled requests, validate assertions, and log microsecond latency metrics.
              </p>
              <div className="rounded-lg bg-muted/60 p-2.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 border border-border/50">
                Worker: active<br/>
                Latency: 78.4ms (monotonic)<br/>
                Assertions: 3/3 passed
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-border/80 bg-card/85 p-6 shadow-xs backdrop-blur-md space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white font-mono font-bold text-sm shadow-xs">
                  03
                </span>
                <span className="font-extrabold text-base text-foreground">Instant Alerts</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When an assertion fails, deduplicated alerts dispatch immediately via SMTP and Webhooks without noisy alert storms.
              </p>
              <div className="rounded-lg bg-muted/60 p-2.5 font-mono text-[11px] text-blue-600 dark:text-blue-400 border border-border/50">
                Dispatch: SMTP + Webhook<br/>
                Deduplication: Active (15m)<br/>
                Status: Delivered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix: APIWatch vs Legacy Ping Tools */}
      <section className="py-20 border-t border-border/80 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Why APIWatch vs Basic Pingers
            </h2>
            <p className="mt-3 text-base text-muted-foreground font-medium">
              Traditional ping tools only check if a server responds with 200. APIWatch inspects the entire HTTP payload.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-2xl border border-border/80 bg-card/90 shadow-sm overflow-hidden backdrop-blur-md">
            <div className="grid grid-cols-3 p-4 border-b border-border/80 font-bold text-xs sm:text-sm bg-muted/50">
              <span className="text-foreground">Monitoring Feature</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">APIWatch Pro</span>
              <span className="text-muted-foreground">Legacy Uptime Tools</span>
            </div>

            <div className="divide-y divide-border/60 text-xs sm:text-sm">
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-medium text-foreground">Deep JSON Body Assertions</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="h-4 w-4" /> Yes (Exact &amp; Key)
                </span>
                <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                  <X className="h-4 w-4" /> Status code only
                </span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-medium text-foreground">Encrypted Headers (AES-256-GCM)</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="h-4 w-4" /> Authenticated Vault
                </span>
                <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                  <X className="h-4 w-4" /> Plaintext or None
                </span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-medium text-foreground">SSRF &amp; Private IP Blocking</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="h-4 w-4" /> Full RFC Sandbox
                </span>
                <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                  <X className="h-4 w-4" /> No protection
                </span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-medium text-foreground">Smart Alert Storm Suppression</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="h-4 w-4" /> Deduplicated Cooldown
                </span>
                <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                  <X className="h-4 w-4" /> Noisy email spam
                </span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-medium text-foreground">Next.js 16 Partial Prerendering (PPR)</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="h-4 w-4" /> Instant Global Edge
                </span>
                <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                  <X className="h-4 w-4" /> Slow SSR/CSR
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vibrant High-Energy CTA Section */}
      <section className="py-20 border-t border-border/80 relative overflow-hidden">
        {/* Glow backdrop inside CTA */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/15 to-teal-500/10 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-8 text-center max-w-4xl relative">
          <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
            {/* Ambient particles */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
              Start Monitoring Your Critical APIs in 2 Minutes
            </h2>
            <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto font-medium">
              No credit card required. Register, add your first monitor endpoint, and let our distributed BullMQ engine handle the rest.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg text-base font-bold text-blue-900 bg-white hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                <span>Create Free Account</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-lg text-base font-semibold text-white bg-blue-700/60 hover:bg-blue-700/90 border border-white/20 shadow-sm transition-all duration-200 active:scale-95 backdrop-blur-xs"
              >
                <span>Explore Live Demo</span>
              </Link>
            </div>

            <p className="mt-6 text-xs text-blue-200 font-medium">
              Instant setup · Real-time telemetry · Zero false-positive guarantee
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}