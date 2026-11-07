import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Code2,
  Radio,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with Ambient Light Gradient */}
      <section className="relative overflow-hidden border-b border-border/80 py-20 md:py-28 bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-background dark:from-background dark:via-background dark:to-muted/20">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-blue-500/25 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-teal-500/10 text-blue-700 dark:text-blue-300 mb-6 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Next-Gen API Telemetry &amp; Uptime Engine</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Precision API Monitoring for Modern Engineering
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto font-medium">
              Detect downtime and performance degradation before your users do. Validate HTTP status codes,
              response times, encrypted headers, and JSON payloads with millisecond precision.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all duration-200 active:scale-95"
              >
                <Zap className="h-4 w-4" />
                Open Dashboard
              </Link>
              <Link
                href="/status"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-10 px-6 gap-2 font-semibold bg-card/80 hover:bg-card shadow-2xs"
                )}
              >
                <Radio className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Live Status Page
              </Link>
            </div>
          </div>

          {/* Interactive Live Preview Mockup with Elevated Ambient Tint */}
          <div className="mt-14 mx-auto max-w-4xl rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/90 p-5 sm:p-7 shadow-xl backdrop-blur-sm card-elevated">
            <div className="flex items-center justify-between border-b border-border/80 pb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-foreground font-bold">apiwatch.worker.telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono py-0 font-bold"
                >
                  ● Active Probes: 14/14
                </Badge>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/80 bg-gradient-to-br from-emerald-500/10 via-background to-background p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
                  <span>SYSTEM UPTIME</span>
                  <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">99.98%</div>
                <p className="mt-1 text-xs text-muted-foreground font-medium">
                  Zero service interruptions in 30d
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-gradient-to-br from-blue-500/10 via-background to-background p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
                  <span>AVG RESPONSE LATENCY</span>
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="mt-2 text-2xl font-extrabold font-mono text-foreground">118ms</div>
                <p className="mt-1 text-xs text-muted-foreground font-medium">
                  Monotonic clock benchmark
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-gradient-to-br from-purple-500/10 via-background to-background p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
                  <span>SECURITY BOUNDARY</span>
                  <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="mt-2 text-2xl font-extrabold font-mono text-foreground">AES-256</div>
                <p className="mt-1 text-xs text-muted-foreground font-medium">
                  SSRF Shield + Encrypted Secrets
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Engineered for Critical Workloads
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground font-medium">
              Everything you need to monitor mission-critical HTTP endpoints without false positives or maintenance burden.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card className="hover:border-border transition-all card-elevated bg-gradient-to-br from-blue-50/40 via-card to-card dark:from-card">
              <CardHeader>
                <div className="h-9 w-9 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 shadow-2xs">
                  <Activity className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Sub-Minute Polling</CardTitle>
                <CardDescription className="text-xs">
                  Probing intervals from 30 seconds to 1 hour executed by distributed BullMQ workers with exponential backoff.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-border transition-all card-elevated bg-gradient-to-br from-emerald-50/40 via-card to-card dark:from-card">
              <CardHeader>
                <div className="h-9 w-9 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 shadow-2xs">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Multi-Rule Assertions</CardTitle>
                <CardDescription className="text-xs">
                  Validate expected HTTP status codes, case-insensitive response headers, and exact or substring body tokens.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-border transition-all card-elevated bg-gradient-to-br from-purple-50/40 via-card to-card dark:from-card">
              <CardHeader>
                <div className="h-9 w-9 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 shadow-2xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">SSRF &amp; Injection Shield</CardTitle>
                <CardDescription className="text-xs">
                  Comprehensive network protection blocking private IP ranges, loopbacks, cloud metadata, and CSV formula injection.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-border transition-all card-elevated bg-gradient-to-br from-amber-50/40 via-card to-card dark:from-card">
              <CardHeader>
                <div className="h-9 w-9 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 shadow-2xs">
                  <Bell className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Deduplicated Alerting</CardTitle>
                <CardDescription className="text-xs">
                  Instant notifications via SMTP Email and Webhooks with intelligent suppression windows to avoid notification fatigue.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-border transition-all card-elevated bg-gradient-to-br from-rose-50/40 via-card to-card dark:from-card">
              <CardHeader>
                <div className="h-9 w-9 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 shadow-2xs">
                  <Radio className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Public Status Page</CardTitle>
                <CardDescription className="text-xs">
                  Zero-leakage, high-performance status dashboard powered by Next.js 16 Partial Prerendering (PPR).
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-border transition-all card-elevated bg-gradient-to-br from-slate-100/60 via-card to-card dark:from-card">
              <CardHeader>
                <div className="h-9 w-9 rounded-lg bg-slate-500/15 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-2 shadow-2xs">
                  <Code2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Encrypted Headers</CardTitle>
                <CardDescription className="text-xs">
                  Store custom API keys and Bearer tokens safely. All sensitive payload headers are encrypted with AES-256-GCM.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/80 bg-gradient-to-b from-muted/30 to-muted/60">
        <div className="container mx-auto px-4 sm:px-8 text-center max-w-3xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Start Monitoring Your APIs in 2 Minutes
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground font-medium">
            No credit card required. Register, configure your endpoint, and let our background engine handle the rest.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all duration-200 active:scale-95"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
