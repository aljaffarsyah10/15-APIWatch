import prisma from "@/lib/db/prisma";
import { encrypt } from "@/lib/security/encryption";
import type { AlertChannelType } from "@prisma/client";

export interface CreateAlertChannelInput {
  type: AlertChannelType;
  destination: string;
  secret?: string;
  isEnabled?: boolean;
}

export interface UpdateAlertChannelInput {
  destination?: string;
  secret?: string;
  isEnabled?: boolean;
}

export class AlertService {
  /**
   * List alert channels for user.
   */
  static async listChannels(userId: string) {
    const channels = await prisma.alertChannel.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Don't expose encrypted secret
    return channels.map((c) => ({
      id: c.id,
      type: c.type,
      destination: c.destination,
      isEnabled: c.isEnabled,
      hasSecret: !!c.secretEncrypted,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  /**
   * Create new alert channel.
   */
  static async createChannel(userId: string, input: CreateAlertChannelInput) {
    const secretEncrypted = input.secret ? encrypt(input.secret) : null;

    const channel = await prisma.alertChannel.create({
      data: {
        userId,
        type: input.type,
        destination: input.destination,
        secretEncrypted,
        isEnabled: input.isEnabled ?? true,
      },
    });

    return {
      id: channel.id,
      type: channel.type,
      destination: channel.destination,
      isEnabled: channel.isEnabled,
      createdAt: channel.createdAt,
    };
  }

  /**
   * Update alert channel.
   */
  static async updateChannel(
    userId: string,
    channelId: string,
    input: UpdateAlertChannelInput
  ) {
    const existing = await prisma.alertChannel.findFirst({
      where: { id: channelId, userId },
    });

    if (!existing) {
      throw new Error("NOT_FOUND: Alert channel not found or unauthorized");
    }

    const data: {
      destination?: string;
      secretEncrypted?: string | null;
      isEnabled?: boolean;
    } = {};

    if (input.destination !== undefined) data.destination = input.destination;
    if (input.isEnabled !== undefined) data.isEnabled = input.isEnabled;
    if (input.secret !== undefined) {
      data.secretEncrypted = input.secret ? encrypt(input.secret) : null;
    }

    const updated = await prisma.alertChannel.update({
      where: { id: channelId },
      data,
    });

    return {
      id: updated.id,
      type: updated.type,
      destination: updated.destination,
      isEnabled: updated.isEnabled,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Delete alert channel.
   */
  static async deleteChannel(userId: string, channelId: string) {
    const existing = await prisma.alertChannel.findFirst({
      where: { id: channelId, userId },
    });

    if (!existing) {
      throw new Error("NOT_FOUND: Alert channel not found or unauthorized");
    }

    await prisma.alertChannel.delete({
      where: { id: channelId },
    });

    return { id: channelId, deleted: true };
  }
}
