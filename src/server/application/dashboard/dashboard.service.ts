import prisma from "@/lib/db/prisma";
import {
  calculateUptimePercentage,
  calculateAverageLatency,
} from "@/server/domain/metrics";

export class DashboardService {
  /**
   * Get user dashboard aggregate summary metrics.
   */
  static async getSummary(userId: string) {
    const monitors = await prisma.monitor.findMany({
      where: { userId },
      include: {
        checks: {
          take: 20,
          orderBy: { createdAt: "desc" },
          select: {
            status: true,
            responseTimeMs: true,
          },
        },
      },
    });

    const totalMonitors = monitors.length;
    const upMonitors = monitors.filter((m) => m.status === "UP").length;
    const downMonitors = monitors.filter((m) => m.status === "DOWN").length;
    const pausedMonitors = monitors.filter((m) => m.status === "PAUSED").length;

    // Collect all checks across user monitors
    const allRecentChecks = monitors.flatMap((m) => m.checks);
    const overallUptime = calculateUptimePercentage(allRecentChecks);
    const avgResponseTimeMs = calculateAverageLatency(allRecentChecks);

    // Active incidents: monitors currently DOWN
    const activeIncidents = monitors
      .filter((m) => m.status === "DOWN")
      .map((m) => ({
        id: m.id,
        name: m.name,
        url: m.url,
        lastCheckedAt: m.lastCheckedAt,
      }));

    return {
      totalMonitors,
      upMonitors,
      downMonitors,
      pausedMonitors,
      overallUptime,
      avgResponseTimeMs,
      activeIncidentsCount: activeIncidents.length,
      activeIncidents,
    };
  }
}
