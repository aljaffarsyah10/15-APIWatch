import React, { Suspense } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-transparent relative">
      {/* Dynamic Ambient Mesh Glows & Architectural Tech Grid (Light & Dark) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
      >
        {/* Soft Indigo / Blue Bloom (Top Left) */}
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/18 via-blue-500/12 to-transparent blur-3xl dark:from-blue-600/15 dark:via-indigo-900/15 animate-pulse-subtle" />
        
        {/* Sky / Cyan Radiant Bloom (Top Right) */}
        <div className="absolute top-1/4 -right-24 h-96 w-96 rounded-full bg-gradient-to-bl from-sky-400/18 via-teal-400/10 to-transparent blur-3xl dark:from-sky-700/12 dark:via-emerald-950/15" />
        
        {/* Gentle Emerald / Teal Pulse (Bottom Center) */}
        <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400/12 via-indigo-500/8 to-transparent blur-3xl dark:from-teal-900/10 dark:via-blue-950/15" />
        
        {/* High-Precision Micro-Dot Matrix Mask */}
        <div className="absolute inset-0 bg-tech-grid [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 dark:opacity-20" />
      </div>

      {/* Desktop Sidebar (Fixed Left) */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <Suspense fallback={<div className="w-64 h-full border-r bg-card/80 backdrop-blur-md" />}>
          <AppSidebar />
        </Suspense>
      </div>

      {/* Main Content Area (Offset for Desktop Sidebar) */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <Suspense fallback={<div className="h-14 border-b bg-background/80 backdrop-blur-md" />}>
          <AppHeader />
        </Suspense>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
