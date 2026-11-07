"use client";

import React, { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 text-muted-foreground ${className ?? ""}`}
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`h-8 w-8 text-muted-foreground hover:text-foreground transition-colors ${className ?? ""}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 rotate-0 scale-100" />
      )}
    </Button>
  );
}
