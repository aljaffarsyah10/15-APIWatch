import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardService } from "@/server/application/dashboard/dashboard.service";
import prisma from "@/lib/db/prisma";

vi.mock("@/lib/db/prisma", () => {
  return {
    default: {
      monitor: {
        findMany: vi.fn(),
      },
    },
    prisma: {
      monitor: {
        findMany: vi.fn(),
      },
    },
  };
});

describe("Dashboard Service Integration", () => {
  const userId = "usr-dashboard-test";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate zeroed summary metrics when user has no monitors", async () => {
    vi.mocked(prisma.monitor.findMany).mockResolvedValue([]);

    const summary = await DashboardService.getSummary(userId);

    expect(summary.totalMonitors).toBe(0);
    expect(summary.upMonitors).toBe(0);
    expect(summary.downMonitors).toBe(0);
    expect(summary.pausedMonitors).toBe(0);
    expect(summary.overallUptime).toBe(100);
    expect(summary.avgResponseTimeMs).toBe(0);
    expect(summary.activeIncidents).toHaveLength(0);
  });

  it("should accurately aggregate status, uptime, latency, and active incidents", async () => {
    const mockMonitors = [
      {
        id: "mon-1",
        name: "Billing API",
        url: "https://billing.example.com/health",
        status: "UP" as const,
        lastCheckedAt: new Date(),
        checks: [
          { status: "SUCCESS" as const, responseTimeMs: 120 },
          { status: "SUCCESS" as const, responseTimeMs: 130 },
        ],
      },
      {
        id: "mon-2",
        name: "Auth Service",
        url: "https://auth.example.com/health",
        status: "DOWN" as const,
        lastCheckedAt: new Date(),
        checks: [
          { status: "FAILURE" as const, responseTimeMs: 500 },
          { status: "SUCCESS" as const, responseTimeMs: 150 },
        ],
      },
      {
        id: "mon-3",
        name: "Staging API",
        url: "https://staging.example.com",
        status: "PAUSED" as const,
        lastCheckedAt: null,
        checks: [],
      },
    ];

    vi.mocked(prisma.monitor.findMany).mockResolvedValue(
      mockMonitors as unknown as Awaited<ReturnType<typeof prisma.monitor.findMany>>
    );

    const summary = await DashboardService.getSummary(userId);

    expect(summary.totalMonitors).toBe(3);
    expect(summary.upMonitors).toBe(1);
    expect(summary.downMonitors).toBe(1);
    expect(summary.pausedMonitors).toBe(1);

    // 4 checks total: 3 SUCCESS, 1 FAILURE = 75%
    expect(summary.overallUptime).toBe(75);

    // Average latency of [120, 130, 500, 150] = 900 / 4 = 225ms
    expect(summary.avgResponseTimeMs).toBe(225);

    // Active incidents should report only DOWN monitors
    expect(summary.activeIncidentsCount).toBe(1);
    expect(summary.activeIncidents[0].name).toBe("Auth Service");
  });
});
