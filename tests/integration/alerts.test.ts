import { describe, it, expect, vi, beforeEach } from "vitest";
import { AlertService } from "@/server/application/alerts/alert.service";
import prisma from "@/lib/db/prisma";
import type { AlertChannel } from "@prisma/client";

vi.mock("@/lib/db/prisma", () => {
  return {
    default: {
      alertChannel: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
    prisma: {
      alertChannel: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

describe("Alert Channel Service Integration", () => {
  const userId = "usr-alert-test";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create email alert channel", async () => {
    const mockChannel = {
      id: "chan-email-1",
      userId,
      type: "EMAIL" as const,
      destination: "oncall@company.com",
      secretEncrypted: null,
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.alertChannel.create).mockResolvedValue(
      mockChannel as unknown as AlertChannel
    );

    const result = await AlertService.createChannel(userId, {
      type: "EMAIL",
      destination: "oncall@company.com",
    });

    expect(result.id).toBe("chan-email-1");
    expect(result.type).toBe("EMAIL");
    expect(prisma.alertChannel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId,
          type: "EMAIL",
          destination: "oncall@company.com",
          secretEncrypted: null,
        }),
      })
    );
  });

  it("should encrypt webhook signing secret with AES-256-GCM when creating webhook channel", async () => {
    const mockChannel = {
      id: "chan-webhook-1",
      userId,
      type: "WEBHOOK" as const,
      destination: "https://api.company.com/webhook",
      secretEncrypted: "encrypted",
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.alertChannel.create).mockResolvedValue(
      mockChannel as unknown as AlertChannel
    );

    await AlertService.createChannel(userId, {
      type: "WEBHOOK",
      destination: "https://api.company.com/webhook",
      secret: "whsec_supersecretkey123",
    });

    const createCall = vi.mocked(prisma.alertChannel.create).mock.calls[0][0];
    const secretEncrypted = createCall.data.secretEncrypted;

    expect(secretEncrypted).toBeDefined();
    expect(secretEncrypted).not.toBe("whsec_supersecretkey123");
    expect(secretEncrypted!.split(":")).toHaveLength(3);
  });

  it("should enforce ownership when updating or deleting channel", async () => {
    vi.mocked(prisma.alertChannel.findFirst).mockResolvedValue(null);

    await expect(
      AlertService.updateChannel(userId, "chan-foreign", { isEnabled: false })
    ).rejects.toThrow("NOT_FOUND");

    await expect(
      AlertService.deleteChannel(userId, "chan-foreign")
    ).rejects.toThrow("NOT_FOUND");
  });
});
