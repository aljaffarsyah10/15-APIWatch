import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">APIWatch</span>
            <Badge variant="outline" className="text-xs font-medium">
              v1.0 MVP
            </Badge>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="#features"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Features
            </Link>
            <Link
              href="#architecture"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Architecture
            </Link>
            <Link
              href="#get-started"
              className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
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
                <Button size="lg" className="h-11 px-6 gap-2">
                  <Zap className="h-4 w-4" />
                  Explore Dashboard
                </Button>
                <Button size="lg" variant="outline" className="h-11 px-6 gap-2">
                  <Terminal className="h-4 w-4" />
                  View PRD & Architecture
                </Button>
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
                  <Badge variant="outline" className="text-emerald-600 border-emerald-300 dark:border-emerald-800">
                    Engine Active
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Active Monitors</span>
                    <Activity className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold">12 / 12</div>
                  <p className="mt-1 text-xs text-muted-foreground">100% operational uptime</p>
                </div>

                <div className="rounded-lg border bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Avg Response Time</span>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold">142 ms</div>
                  <p className="mt-1 text-xs text-muted-foreground">p95 latency within threshold</p>
                </div>

                <div className="rounded-lg border bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Security & SSRF</span>
                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold">Protected</div>
                  <p className="mt-1 text-xs text-muted-foreground">Safe DNS & private IP blocking</p>
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
                  <Bell className="h-6 w-6 text-primary mb-2" />
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

        {/* Phase Status Banner */}
        <section id="architecture" className="py-16 border-t">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="rounded-2xl border bg-card p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Phase 1 Bootstrap Complete
                  </Badge>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                    APIWatch Foundation Ready
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Next.js App Router, TypeScript Strict, Tailwind CSS, and shadcn/ui components initialized.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    Next.js 16 + React 19
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>© 2026 APIWatch. Built according to PRD & Playbook specifications.</p>
        </div>
      </footer>
    </div>
  );
}
