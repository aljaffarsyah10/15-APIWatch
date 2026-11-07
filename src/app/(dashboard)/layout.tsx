import React, { Suspense } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar (Fixed Left) */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <Suspense fallback={<div className="w-64 h-full border-r bg-card" />}>
          <AppSidebar />
        </Suspense>
      </div>

      {/* Main Content Area (Offset for Desktop Sidebar) */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <Suspense fallback={<div className="h-14 border-b bg-background" />}>
          <AppHeader />
        </Suspense>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
