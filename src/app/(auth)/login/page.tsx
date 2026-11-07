import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <Card className="shadow-lg border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold">Sign In to APIWatch</CardTitle>
        <CardDescription className="text-xs">
          Enter your email and password to access your monitors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="developer@example.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className={cn(buttonVariants(), "w-full text-center")}
        >
          Sign In (UI Preview)
        </Link>
        <div className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
