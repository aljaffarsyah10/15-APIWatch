import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="outline" className="mb-3 text-xs">
          Transparent Pricing
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Simple, Predictable Plans for Developers
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Start for free during our MVP release. Upgrade whenever your systems scale.
        </p>
      </div>

      <div className="mt-12 grid max-w-4xl mx-auto gap-8 md:grid-cols-2">
        {/* Free Community Tier */}
        <Card className="flex flex-col justify-between border-2">
          <CardHeader>
            <CardTitle className="text-xl">Developer (MVP Free)</CardTitle>
            <CardDescription>
              Perfect for personal APIs, hobby projects, and early-stage MVPs.
            </CardDescription>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight">$0</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Up to 10 active monitors</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>5-minute minimum check intervals</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Email failure and recovery alerts</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>30-day monitoring check history</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Full SSRF & DNS rebinding protection</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link
              href="/register"
              className={cn(buttonVariants(), "w-full text-center")}
            >
              Get Started Free
            </Link>
          </CardFooter>
        </Card>

        {/* Pro Tier (Planned) */}
        <Card className="flex flex-col justify-between border-primary/50 relative shadow-md">
          <div className="absolute -top-3 right-6">
            <Badge className="bg-primary text-primary-foreground text-xs">
              Coming Soon
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-xl">Pro Engineering</CardTitle>
            <CardDescription>
              Designed for high-throughput production services and fast response teams.
            </CardDescription>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight">$19</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Up to 100 active monitors</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>1-minute check intervals</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Custom Webhooks & Slack integration</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>90-day retention & analytics export</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Priority worker queue execution</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full text-center"
              )}
            >
              Sign Up for Beta
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

