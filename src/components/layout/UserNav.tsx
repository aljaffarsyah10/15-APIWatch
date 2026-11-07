"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Bell, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/auth-client";

interface UserNavProps {
  user?: {
    name: string;
    email: string;
  };
}

export function UserNav({
  user = { name: "Developer", email: "dev@apiwatch.dev" },
}: UserNavProps) {
  const router = useRouter();
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.info("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full p-0 ring-1 ring-border hover:ring-ring transition-all"
          >
            <Avatar size="sm" className="h-8 w-8">
              <AvatarFallback className="text-xs font-semibold bg-secondary text-secondary-foreground">
                {initials || "AW"}
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal p-2.5">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-foreground">
                {user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            render={
              <Link
                href="/settings"
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-medium"
              />
            }
          >
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Account Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <Link
                href="/settings/alerts"
                className="flex items-center gap-2 cursor-pointer w-full text-xs font-medium"
              />
            }
          >
            <Bell className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Alert Preferences</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <Link
                href="/status"
                target="_blank"
                className="flex items-center justify-between cursor-pointer w-full text-xs font-medium"
              />
            }
          >
            <span>Public Status Page</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-rose-600 dark:text-rose-400 cursor-pointer w-full text-xs font-medium"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
