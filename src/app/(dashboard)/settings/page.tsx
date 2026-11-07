import React from "react";
import Link from "next/link";
import { Key, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { PageHeader } from "@/components/shared/PageHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Account Settings"
        description="Manage your profile information and global application preferences"
      />

      <div className="flex gap-2 border-b pb-2 text-sm">
        <Link
          href="/settings"
          className="font-medium text-primary border-b-2 border-primary pb-2 -mb-2"
        >
          General
        </Link>
        <Link
          href="/settings/alerts"
          className="text-muted-foreground hover:text-foreground pb-2 transition-colors ml-4"
        >
          Alert Channels
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                Profile Information
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Your personal details and login credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" defaultValue="Developer User" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue="developer@example.com"
                readOnly
                className="bg-muted/50"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button size="sm">Save Changes (UI Preview)</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                Security & Authentication
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Session management powered by Better Auth
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your session is active. Passwords are securely hashed with Argon2id.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
