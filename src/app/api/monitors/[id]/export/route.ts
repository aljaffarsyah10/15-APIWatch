import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Escapes CSV field value to prevent formula injection (CVE-2014-3524 / CWE-1236).
 */
export function sanitizeCsvField(val: unknown): string {
  if (val === null || val === undefined) {
    return '""';
  }

  let str = String(val);

  // If starts with formula triggers, prepend single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape existing double quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;

  const monitor = await prisma.monitor.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!monitor) {
    return new Response("Monitor not found", { status: 404 });
  }

  const checks = await prisma.monitorCheck.findMany({
    where: { monitorId: id },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const headers = [
    "Check ID",
    "Monitor Name",
    "Status",
    "HTTP Status",
    "Response Time (ms)",
    "Failure Reason",
    "Checked At",
  ];

  const rows = checks.map((c) => [
    sanitizeCsvField(c.id),
    sanitizeCsvField(monitor.name),
    sanitizeCsvField(c.status),
    sanitizeCsvField(c.httpStatus ?? "N/A"),
    sanitizeCsvField(c.responseTimeMs ?? "N/A"),
    sanitizeCsvField(c.failureReason ?? "None"),
    sanitizeCsvField(c.checkedAt ? c.checkedAt.toISOString() : c.createdAt.toISOString()),
  ]);

  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\r\n");

  const safeFilename = monitor.name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .slice(0, 30);

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="apiwatch-${safeFilename}-history.csv"`,
      "Cache-Control": "no-cache",
    },
  });
}
