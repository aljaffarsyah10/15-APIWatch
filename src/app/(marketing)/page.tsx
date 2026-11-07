import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  Radio,
  ShieldCheck,
  Zap,
  Lock,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InteractiveConsoleDemo } from "@/features/marketing/components/InteractiveConsoleDemo";
import { InteractiveAssertionTester } from "@/features/marketing/components/InteractiveAssertionTester";
import { FaqAccordion } from "@/features/marketing/components/FaqAccordion";

export default function HomePage() {
  return (
    <div className="flex flex-col relative overflow-hidden selection:bg-blue-500/20 selection:text-blue-600">
      {/* Dynamic Animated Ambient Background Orbs & Tech Grid */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
      >
        {/* Animated Blob 1: Top-Left Indigo/Blue Flow */}
        <div className="absolute -top-40 -left-20 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-indigo-500/22 via-blue-500/18 to-transparent blur-3xl dark:from-blue-600/18 dark:via-indigo-900/18 animate-blob-1" />

        {/* Animated Blob 2: Top-Right Radiant Sky/Cyan Orbit */}
        <div className="absolute top-1/4 -right-28 h-[580px] w-[580px] rounded-full bg-gradient-to-bl from-sky-400/22 via-teal-400/18 to-transparent blur-3xl dark:from-sky-700/15 dark:via-emerald-950/18 animate-blob-2" />

        {/* Animated Blob 3: Bottom-Center Aurora Warmth & Emerald Tone */}
        <div className="absolute top-2/3 left-1/5 h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-purple-400/18 via-pink-400/12 to-emerald-400/10 blur-3xl dark:from-purple-900/12 dark:via-blue-950/15 animate-blob-3" />

        {/* Ambient Shimmering Light Ray */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent blur-2xl animate-shimmer-ray pointer-events-none" />

        {/* High-Precision Architectural Tech Grid Overlay */}
        <div className="absolute inset-0 bg-tech-grid [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,#000_75%,transparent_100%)] opacity-35 dark:opacity-20" />
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

          {/* Showstopper: Live Interactive Telemetry Console Mockup with Real-time UX */}
          <InteractiveConsoleDemo />
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

      {/* Interactive UX Section: Rule Assertion Simulator */}
      <section className="py-20 border-t border-border/80 bg-gradient-to-b from-card/30 via-background to-background">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <InteractiveAssertionTester />
          </div>
        </div>
      </section>

      {/* 3-Step Architecture Pipeline */}
      <section className="py-20 border-t border-border/80 bg-background/50">
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
            <div className="relative rounded-2xl border border-border/80 bg-card/85 p-6 shadow-xs backdrop-blur-md space-y-4 card-elevated">
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
            <div className="relative rounded-2xl border border-border/80 bg-card/85 p-6 shadow-xs backdrop-blur-md space-y-4 card-elevated">
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
            <div className="relative rounded-2xl border border-border/80 bg-card/85 p-6 shadow-xs backdrop-blur-md space-y-4 card-elevated">
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

      {/* FAQ Section with Interactive Accordions */}
      <section className="py-20 border-t border-border/80 bg-background/60">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 mb-3">
              KNOWLEDGE BASE
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-base text-muted-foreground font-medium">
              Everything you need to know about APIWatch security, scheduling, and reliability.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* Vibrant High-Energy CTA Section */}
      <section className="py-20 border-t border-border/80 relative overflow-hidden">
        {/* Glow backdrop inside CTA */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/15 to-teal-500/10 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-8 text-center max-w-4xl relative">
          <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden card-elevated">
            {/* Ambient particles */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none animate-pulse-subtle" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-400/20 blur-2xl pointer-events-none animate-pulse-subtle" />

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