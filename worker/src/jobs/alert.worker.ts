import { Worker, type Job } from "bullmq";
import prisma from "@/lib/db/prisma";
import { sendAlertEmail } from "../alerts/email";
import { sendAlertWebhook } from "../alerts/webhook";
import {
  ALERT_EMAIL_QUEUE,
  ALERT_WEBHOOK_QUEUE,
  type AlertEmailJobData,
  type AlertWebhookJobData,
} from "../lib/queues";
import { defaultRedisConnection } from "../lib/redis";

export function createAlertEmailWorker(): Worker<AlertEmailJobData> {
  return new Worker<AlertEmailJobData>(
    ALERT_EMAIL_QUEUE,
    async (job: Job<AlertEmailJobData>) => {
      const { eventId } = job.data;
      try {
        await sendAlertEmail(job.data);

        await prisma.alertEvent.update({
          where: { id: eventId },
          data: {
            deliveryStatus: "SENT",
            deliveredAt: new Date(),
          },
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        await prisma.alertEvent.update({
          where: { id: eventId },
          data: {
            deliveryStatus: "FAILED",
            lastError: message,
            attemptCount: { increment: 1 },
          },
        });
        throw err;
      }
    },
    {
      connection: defaultRedisConnection,
      concurrency: 5,
    }
  );
}

export function createAlertWebhookWorker(): Worker<AlertWebhookJobData> {
  return new Worker<AlertWebhookJobData>(
    ALERT_WEBHOOK_QUEUE,
    async (job: Job<AlertWebhookJobData>) => {
      const { eventId } = job.data;
      try {
        await sendAlertWebhook(job.data);

        await prisma.alertEvent.update({
          where: { id: eventId },
          data: {
            deliveryStatus: "SENT",
            deliveredAt: new Date(),
          },
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        await prisma.alertEvent.update({
          where: { id: eventId },
          data: {
            deliveryStatus: "FAILED",
            lastError: message,
            attemptCount: { increment: 1 },
          },
        });
        throw err;
      }
    },
    {
      connection: defaultRedisConnection,
      concurrency: 5,
    }
  );
}
