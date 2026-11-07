import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Continuous API Monitoring Platform
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Reliable API Monitoring for Modern Engineering
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Detect downtime before your users do. Validate HTTP status codes,
              response times, headers, and body payloads automatically with a dedicated
              worker engine.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 gap-2")}
              >
                <Zap className="h-4 w-4" />
                Go to Dashboard
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-11 px-6 gap-2"
                )}
              >
                <Terminal className="h-4 w-4" />
                View Plans & Pricing
              </Link>
            </div>
          </div>

          {/* Visual Preview Card */}
          <div className="mt-12 mx-auto max-w-4xl rounded-xl border bg-card/60 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between border-b pb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-xs">apiwatch.worker.status</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-emerald-600 border-emerald-300 dark:border-emerald-800"
                >
                  Engine Active
                </Badge>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-background/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Active Monitors
                  </span>
                  <Activity className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-2xl font-bold">12 / 12</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  100% operational uptime
                </p>
              </div>

              <div className="rounded-lg border bg-background/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Avg Response Time
                  </span>
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div className="mt-2 text-2xl font-bold">142 ms</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  p95 latency within threshold
                </p>
              </div>

              <div className="rounded-lg border bg-background/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Security & SSRF
                  </span>
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="mt-2 text-2xl font-bold">Protected</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Safe DNS & private IP blocking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Built for High Reliability & Zero Fluff
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to monitor mission-critical APIs without overhead.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Clock className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">Scheduled Health Checks</CardTitle>
                <CardDescription>
                  Runs automated HTTP validations every 1 to 60 minutes via background workers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Custom timeouts & retry policies
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShieldCheck className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">SSRF & Security Isolation</CardTitle>
                <CardDescription>
                  Built-in protection against private network probing and DNS rebinding attacks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  RFC-1918 & metadata validation
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">Instant Alert Dispatch</CardTitle>
                <CardDescription>
                  Receive alerts the second an endpoint fails or latency spikes beyond your SLAs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Email and webhook integration
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
