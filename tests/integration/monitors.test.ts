import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonitorService } from "@/server/application/monitors/monitor.service";
import prisma from "@/lib/db/prisma";
import type { Monitor } from "@prisma/client";

// Mock prisma client for integration testing
vi.mock("@/lib/db/prisma", () => {
  return {
    default: {
      monitor: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      monitorCheck: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
    },
    prisma: {
      monitor: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      monitorCheck: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
    },
  };
});

describe("Monitor Service Integration", () => {
  const userId = "usr-test-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createMonitor", () => {
    it("should successfully create monitor with safe public URL", async () => {
      const mockCreated = {
        id: "mon-1",
        userId,
        name: "Public API",
        url: "https://example.com/api",
        method: "GET" as const,
        intervalSeconds: 60,
        timeoutMs: 10000,
        expectedStatusCodes: [200],
        requestHeadersEncrypted: null,
        requestBodyEncrypted: null,
        expectedHeaders: null,
        bodyValidation: null,
        status: "UNKNOWN" as const,
        isActive: true,
        lastCheckedAt: null,
        lastSuccessfulAt: null,
        nextCheckAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.monitor.create).mockResolvedValue(
        mockCreated as unknown as Monitor
      );

      const result = await MonitorService.createMonitor(userId, {
        name: "Public API",
        url: "https://example.com/api",
        method: "GET",
      });

      expect(result.id).toBe("mon-1");
      expect(prisma.monitor.create).toHaveBeenCalled();
    });

    it("should reject creation of monitor pointing to private IP (SSRF Protection)", async () => {
      await expect(
        MonitorService.createMonitor(userId, {
          name: "Malicious Internal Target",
          url: "http://127.0.0.1:8080/admin",
        })
      ).rejects.toThrow("SSRF_ERROR");

      expect(prisma.monitor.create).not.toHaveBeenCalled();
    });

    it("should reject creation of monitor pointing to cloud metadata service", async () => {
      await expect(
        MonitorService.createMonitor(userId, {
          name: "AWS Metadata Probe",
          url: "http://169.254.169.254/latest/meta-data/",
        })
      ).rejects.toThrow("SSRF_ERROR");

      expect(prisma.monitor.create).not.toHaveBeenCalled();
    });
  });

  describe("User Ownership & Isolation", () => {
    it("should return null when user tries to access another user's monitor", async () => {
      vi.mocked(prisma.monitor.findFirst).mockResolvedValue(null);

      const result = await MonitorService.getMonitorById(userId, "mon-other");
      expect(result).toBeNull();
      expect(prisma.monitor.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "mon-other", userId },
        })
      );
    });

    it("should throw NOT_FOUND when user tries to update another user's monitor", async () => {
      vi.mocked(prisma.monitor.findFirst).mockResolvedValue(null);

      await expect(
        MonitorService.updateMonitor(userId, "mon-other", { name: "Hijacked" })
      ).rejects.toThrow("NOT_FOUND");
    });

    it("should throw NOT_FOUND when user tries to delete another user's monitor", async () => {
      vi.mocked(prisma.monitor.findFirst).mockResolvedValue(null);

      await expect(
        MonitorService.deleteMonitor(userId, "mon-other")
      ).rejects.toThrow("NOT_FOUND");

      expect(prisma.monitor.delete).not.toHaveBeenCalled();
    });
  });

  describe("Lifecycle Actions: Pause and Resume", () => {
    it("should pause an active monitor", async () => {
      vi.mocked(prisma.monitor.findFirst).mockResolvedValue({
        id: "mon-1",
        userId,
      } as unknown as Monitor);

      vi.mocked(prisma.monitor.update).mockResolvedValue({
        id: "mon-1",
        status: "PAUSED",
        isActive: false,
      } as unknown as Monitor);

      const result = await MonitorService.pauseMonitor(userId, "mon-1");
      expect(result.status).toBe("PAUSED");
      expect(prisma.monitor.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "mon-1" },
          data: { status: "PAUSED", isActive: false, nextCheckAt: null },
        })
      );
    });

    it("should resume a paused monitor", async () => {
      vi.mocked(prisma.monitor.findFirst).mockResolvedValue({
        id: "mon-1",
        userId,
      } as unknown as Monitor);

      vi.mocked(prisma.monitor.update).mockResolvedValue({
        id: "mon-1",
        status: "UNKNOWN",
        isActive: true,
      } as unknown as Monitor);

      const result = await MonitorService.resumeMonitor(userId, "mon-1");
      expect(result.status).toBe("UNKNOWN");
      expect(result.isActive).toBe(true);
    });
  });
});
