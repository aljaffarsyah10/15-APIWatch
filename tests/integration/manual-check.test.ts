import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/monitors/[id]/check-now/route";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";
import type { Monitor } from "@prisma/client";
import type { NextRequest } from "next/server";

vi.mock("@/lib/db/prisma", () => {
  return {
    default: {
      monitor: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      monitorCheck: {
        create: vi.fn(),
      },
    },
    prisma: {
      monitor: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      monitorCheck: {
        create: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/auth/session", () => ({
  getServerSession: vi.fn(),
}));

describe("Manual Check Endpoint Integration", () => {
  const userId = "usr-check-test";
  const monitorId = "mon-check-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated request with 401", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/monitors/123/check-now", {
      method: "POST",
    }) as unknown as NextRequest;

    const res = await POST(req, { params: Promise.resolve({ id: "123" }) });
    expect(res.status).toBe(401);
  });

  it("should reject manual check when rate limited (< 10 seconds since last check)", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: userId,
        email: "user@test.com",
        name: "User",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "sess-1",
        userId,
        token: "token",
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
      },
    });

    // Checked 3 seconds ago
    const recentCheckDate = new Date(Date.now() - 3000);

    vi.mocked(prisma.monitor.findFirst).mockResolvedValue({
      id: monitorId,
      userId,
      name: "API Monitor",
      url: "https://example.com",
      status: "UP" as const,
      lastCheckedAt: recentCheckDate,
    } as unknown as Monitor);

    const req = new Request(`http://localhost/api/monitors/${monitorId}/check-now`, {
      method: "POST",
    }) as unknown as NextRequest;

    const res = await POST(req, { params: Promise.resolve({ id: monitorId }) });
    expect(res.status).toBe(429);

    const body = await res.json();
    expect(body.error.code).toBe("RATE_LIMITED");
  });

  it("should reject manual check on paused monitor with 400", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: userId,
        email: "user@test.com",
        name: "User",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "sess-1",
        userId,
        token: "token",
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
      },
    });

    vi.mocked(prisma.monitor.findFirst).mockResolvedValue({
      id: monitorId,
      userId,
      name: "Paused API",
      url: "https://example.com",
      status: "PAUSED" as const,
      lastCheckedAt: null,
    } as unknown as Monitor);

    const req = new Request(`http://localhost/api/monitors/${monitorId}/check-now`, {
      method: "POST",
    }) as unknown as NextRequest;

    const res = await POST(req, { params: Promise.resolve({ id: monitorId }) });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error.code).toBe("MONITOR_PAUSED");
  });
});
