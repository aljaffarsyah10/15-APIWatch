import prisma from "@/lib/db/prisma";
import { encrypt } from "@/lib/security/encryption";
import { validateTargetUrl } from "@/lib/security/ssrf";
import {
  calculateUptimePercentage,
  calculateAverageLatency,
  calculateP95Latency,
} from "@/server/domain/metrics";
import { Prisma, type HttpMethod, type MonitorStatus } from "@prisma/client";

export interface CreateMonitorInput {
  name: string;
  url: string;
  method?: HttpMethod;
  intervalSeconds?: number;
  timeoutMs?: number;
  expectedStatusCodes?: number[];
  requestHeaders?: Record<string, string>;
  requestBody?: string;
  expectedHeaders?: Record<string, string>;
  bodyValidation?: {
    type: "contains" | "equals" | "json_path";
    target?: string;
    expectedValue?: string;
  };
}

export interface UpdateMonitorInput {
  name?: string;
  url?: string;
  method?: HttpMethod;
  intervalSeconds?: number;
  timeoutMs?: number;
  expectedStatusCodes?: number[];
  requestHeaders?: Record<string, string>;
  requestBody?: string;
  expectedHeaders?: Record<string, string>;
  bodyValidation?: {
    type: "contains" | "equals" | "json_path";
    target?: string;
    expectedValue?: string;
  };
}

export interface ListMonitorsFilter {
  page?: number;
  limit?: number;
  status?: MonitorStatus;
  search?: string;
}

export class MonitorService {
  /**
   * List monitors belonging to user with optional search and status filtering.
   */
  static async listMonitors(userId: string, filter: ListMonitorsFilter = {}) {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.MonitorWhereInput = {
      userId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.search
        ? {
            OR: [
              { name: { contains: filter.search, mode: "insensitive" } },
              { url: { contains: filter.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, monitors] = await Promise.all([
      prisma.monitor.count({ where }),
      prisma.monitor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          checks: {
            take: 10,
            orderBy: { createdAt: "desc" },
            select: {
              status: true,
              responseTimeMs: true,
              checkedAt: true,
            },
          },
        },
      }),
    ]);

    const formattedMonitors = monitors.map((m) => {
      const uptimePercentage = calculateUptimePercentage(m.checks);
      const avgLatencyMs = calculateAverageLatency(m.checks);

      return {
        id: m.id,
        name: m.name,
        url: m.url,
        method: m.method,
        status: m.status,
        isActive: m.isActive,
        intervalSeconds: m.intervalSeconds,
        timeoutMs: m.timeoutMs,
        expectedStatusCodes: m.expectedStatusCodes,
        lastCheckedAt: m.lastCheckedAt,
        lastSuccessfulAt: m.lastSuccessfulAt,
        nextCheckAt: m.nextCheckAt,
        uptimePercentage,
        avgLatencyMs,
        recentChecks: m.checks,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      };
    });

    return {
      monitors: formattedMonitors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get monitor details by ID with ownership verification.
   */
  static async getMonitorById(userId: string, monitorId: string) {
    const monitor = await prisma.monitor.findFirst({
      where: { id: monitorId, userId },
      include: {
        checks: {
          take: 50,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!monitor) {
      return null;
    }

    const uptime = calculateUptimePercentage(monitor.checks);
    const avgLatency = calculateAverageLatency(monitor.checks);
    const p95Latency = calculateP95Latency(monitor.checks);

    return {
      ...monitor,
      uptimePercentage: uptime,
      avgLatencyMs: avgLatency,
      p95LatencyMs: p95Latency,
    };
  }

  /**
   * Create new monitor after SSRF validation and secret encryption.
   */
  static async createMonitor(userId: string, input: CreateMonitorInput) {
    // 1. SSRF URL Check
    const ssrfCheck = await validateTargetUrl(input.url);
    if (!ssrfCheck.isSafe) {
      throw new Error(`SSRF_ERROR: ${ssrfCheck.error}`);
    }

    // 2. Encrypt secrets if provided
    const requestHeadersEncrypted = input.requestHeaders
      ? encrypt(JSON.stringify(input.requestHeaders))
      : null;

    const requestBodyEncrypted = input.requestBody
      ? encrypt(input.requestBody)
      : null;

    const expectedStatusCodes = input.expectedStatusCodes?.length
      ? input.expectedStatusCodes
      : [200];

    const now = new Date();

    const monitor = await prisma.monitor.create({
      data: {
        userId,
        name: input.name,
        url: input.url,
        method: input.method || "GET",
        intervalSeconds: input.intervalSeconds || 60,
        timeoutMs: input.timeoutMs || 10000,
        expectedStatusCodes,
        requestHeadersEncrypted,
        requestBodyEncrypted,
        expectedHeaders: input.expectedHeaders ?? Prisma.JsonNull,
        bodyValidation: input.bodyValidation ?? Prisma.JsonNull,
        status: "UNKNOWN",
        isActive: true,
        nextCheckAt: now, // immediately due for check
      },
    });

    return monitor;
  }

  /**
   * Update monitor configuration.
   */
  static async updateMonitor(
    userId: string,
    monitorId: string,
    input: UpdateMonitorInput
  ) {
    const existing = await prisma.monitor.findFirst({
      where: { id: monitorId, userId },
    });

    if (!existing) {
      throw new Error("NOT_FOUND: Monitor not found or unauthorized");
    }

    if (input.url && input.url !== existing.url) {
      const ssrfCheck = await validateTargetUrl(input.url);
      if (!ssrfCheck.isSafe) {
        throw new Error(`SSRF_ERROR: ${ssrfCheck.error}`);
      }
    }

    const data: Prisma.MonitorUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.url !== undefined) data.url = input.url;
    if (input.method !== undefined) data.method = input.method;
    if (input.intervalSeconds !== undefined)
      data.intervalSeconds = input.intervalSeconds;
    if (input.timeoutMs !== undefined) data.timeoutMs = input.timeoutMs;
    if (input.expectedStatusCodes !== undefined)
      data.expectedStatusCodes = input.expectedStatusCodes;

    if (input.requestHeaders !== undefined) {
      data.requestHeadersEncrypted = encrypt(
        JSON.stringify(input.requestHeaders)
      );
    }

    if (input.requestBody !== undefined) {
      data.requestBodyEncrypted = encrypt(input.requestBody);
    }

    if (input.expectedHeaders !== undefined) {
      data.expectedHeaders = input.expectedHeaders;
    }

    if (input.bodyValidation !== undefined) {
      data.bodyValidation = input.bodyValidation;
    }

    return prisma.monitor.update({
      where: { id: monitorId },
      data,
    });
  }

  /**
   * Delete monitor.
   */
  static async deleteMonitor(userId: string, monitorId: string) {
    const existing = await prisma.monitor.findFirst({
      where: { id: monitorId, userId },
    });

    if (!existing) {
      throw new Error("NOT_FOUND: Monitor not found or unauthorized");
    }

    await prisma.monitor.delete({
      where: { id: monitorId },
    });

    return { id: monitorId, deleted: true };
  }

  /**
   * Pause monitor execution.
   */
  static async pauseMonitor(userId: string, monitorId: string) {
    const existing = await prisma.monitor.findFirst({
      where: { id: monitorId, userId },
    });

    if (!existing) {
      throw new Error("NOT_FOUND: Monitor not found or unauthorized");
    }

    return prisma.monitor.update({
      where: { id: monitorId },
      data: {
        status: "PAUSED",
        isActive: false,
        nextCheckAt: null,
      },
    });
  }

  /**
   * Resume monitor execution.
   */
  static async resumeMonitor(userId: string, monitorId: string) {
    const existing = await prisma.monitor.findFirst({
      where: { id: monitorId, userId },
    });

    if (!existing) {
      throw new Error("NOT_FOUND: Monitor not found or unauthorized");
    }

    return prisma.monitor.update({
      where: { id: monitorId },
      data: {
        status: "UNKNOWN",
        isActive: true,
        nextCheckAt: new Date(),
      },
    });
  }

  /**
   * Get paginated checks history for a monitor.
   */
  static async getMonitorChecks(
    userId: string,
    monitorId: string,
    page = 1,
    limit = 20
  ) {
    const existing = await prisma.monitor.findFirst({
      where: { id: monitorId, userId },
    });

    if (!existing) {
      throw new Error("NOT_FOUND: Monitor not found or unauthorized");
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [total, checks] = await Promise.all([
      prisma.monitorCheck.count({ where: { monitorId } }),
      prisma.monitorCheck.findMany({
        where: { monitorId },
        skip,
        take: safeLimit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      checks,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }
}
