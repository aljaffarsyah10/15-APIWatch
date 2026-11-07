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
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/80 py-20 md:py-28 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>Next-Gen API Telemetry &amp; Uptime Engine</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Precision API Monitoring for Modern Engineering
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              Detect downtime and performance degradation before your users do. Validate HTTP status codes,
              response times, encrypted headers, and JSON payloads with millisecond precision.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "lg" }), "h-10 px-5 gap-2 shadow-sm font-semibold")}
              >
                <Zap className="h-4 w-4" />
                Open Dashboard
              </Link>
              <Link
                href="/status"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-10 px-5 gap-2 font-medium"
                )}
              >
                <Radio className="h-4 w-4 text-emerald-500" />
                Live Status Page
              </Link>
            </div>
          </div>

          {/* Interactive Live Preview Mockup */}
          <div className="mt-14 mx-auto max-w-4xl rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-border/80 pb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-foreground font-medium">apiwatch.worker.telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono py-0"
                >
                  ● Active Probes: 14/14
                </Badge>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border/80 bg-background/60 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span>SYSTEM UPTIME</span>
                  <Activity className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">99.98%</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Zero service interruptions in 30d
                </p>
              </div>

              <div className="rounded-lg border border-border/80 bg-background/60 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span>AVG RESPONSE LATENCY</span>
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-foreground">118ms</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Monotonic clock benchmark
                </p>
              </div>

              <div className="rounded-lg border border-border/80 bg-background/60 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span>SECURITY BOUNDARY</span>
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-foreground">AES-256</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  SSRF Shield + Encrypted Secrets
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Engineered for Critical Workloads
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Everything you need to monitor mission-critical HTTP endpoints without false positives or maintenance burden.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card className="hover:border-border transition-colors">
              <CardHeader>
                <div className="h-9 w-9 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                  <Activity className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold">Sub-Minute Polling</CardTitle>
                <CardDescription className="text-xs">
                  Probing intervals from 30 seconds to 1 hour executed by distributed BullMQ workers with exponential backoff.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-border transition-colors">
              <CardHeader>
                <div className="h-9 w-9 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold">Multi-Rule Assertions</CardTitle>
                <CardDescription className="text-xs">
                  Validate expected HTTP status codes, case-insensitive response headers, and exact or substring body tokens.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-border transition-colors">
              <CardHeader>
                <div className="h-9 w-9 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold">SSRF &amp; Injection Shield</CardTitle>
                <CardDescription className="text-xs">
                  Comprehensive network protection blocking private IP ranges, loopbacks, cloud metadata, and CSV formula injection.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-border transition-colors">
              <CardHeader>
                <div className="h-9 w-9 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                  <Bell className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold">Deduplicated Alerting</CardTitle>
                <CardDescription className="text-xs">
                  Instant notifications via SMTP Email and Webhooks with intelligent suppression windows to avoid notification fatigue.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-border transition-colors">
              <CardHeader>
                <div className="h-9 w-9 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
                  <Radio className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold">Public Status Page</CardTitle>
                <CardDescription className="text-xs">
                  Zero-leakage, high-performance status dashboard powered by Next.js 16 Partial Prerendering (PPR).
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-border transition-colors">
              <CardHeader>
                <div className="h-9 w-9 rounded-md bg-slate-500/10 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-2">
                  <Code2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold">Encrypted Headers</CardTitle>
                <CardDescription className="text-xs">
                  Store custom API keys and Bearer tokens safely. All sensitive payload headers are encrypted with AES-256-GCM.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/80 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-8 text-center max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Start Monitoring Your APIs in 2 Minutes
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">
            No credit card required. Register, configure your endpoint, and let our background engine handle the rest.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "h-10 px-6 gap-2 font-semibold shadow-2xs")}
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
