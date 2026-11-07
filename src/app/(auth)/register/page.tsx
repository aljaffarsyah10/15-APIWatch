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

export default function RegisterPage() {
  return (
    <Card className="shadow-lg border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold">Create an Account</CardTitle>
        <CardDescription className="text-xs">
          Start monitoring your endpoints in under 60 seconds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="John Doe" autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="developer@example.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className={cn(buttonVariants(), "w-full text-center")}
        >
          Create Account (UI Preview)
        </Link>
        <div className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
