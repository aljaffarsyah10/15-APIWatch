import prisma from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { logger } from "../lib/logger";
import { monitorCheckQueue } from "../lib/queues";

const POLL_INTERVAL_MS = parseInt(
  process.env.SCHEDULER_POLL_INTERVAL_MS || "5000",
  10
);

export class SchedulerPoller {
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info("SCHEDULER_STARTED", { intervalMs: POLL_INTERVAL_MS });

    this.poll();
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    logger.info("SCHEDULER_STOPPED");
  }

  private async poll() {
    if (!this.isRunning) return;

    try {
      await this.processDueMonitors();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("SCHEDULER_POLL_ERROR", { error: message });
    } finally {
      if (this.isRunning) {
        this.timer = setTimeout(() => this.poll(), POLL_INTERVAL_MS);
      }
    }
  }

  /**
   * Scans and dispatches due monitors atomically.
   */
  async processDueMonitors(): Promise<number> {
    const now = new Date();

    // Query due monitors
    const dueMonitors = await prisma.monitor.findMany({
      where: {
        isActive: true,
        status: { not: "PAUSED" },
        OR: [{ nextCheckAt: null }, { nextCheckAt: { lte: now } }],
      },
      take: 50,
      select: {
        id: true,
        name: true,
        intervalSeconds: true,
      },
    });

    if (dueMonitors.length === 0) {
      return 0;
    }

    let enqueuedCount = 0;

    for (const monitor of dueMonitors) {
      const nextCheckAt = new Date(
        now.getTime() + monitor.intervalSeconds * 1000
      );

      // Create queued check record and advance nextCheckAt
      try {
        const check = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          await tx.monitor.update({
            where: { id: monitor.id },
            data: { nextCheckAt },
          });

          return tx.monitorCheck.create({
            data: {
              monitorId: monitor.id,
              status: "QUEUED",
            },
          });
        });

        // Enqueue to BullMQ with jobId = checkId for idempotency
        await monitorCheckQueue.add(
          "check",
          {
            checkId: check.id,
            monitorId: monitor.id,
          },
          {
            jobId: check.id,
          }
        );

        enqueuedCount++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn("SCHEDULER_DISPATCH_FAILED", {
          monitorId: monitor.id,
          error: message,
        });
      }
    }

    if (enqueuedCount > 0) {
      logger.info("SCHEDULER_DUE_DISPATCHED", { count: enqueuedCount });
    }

    return enqueuedCount;
  }
}
