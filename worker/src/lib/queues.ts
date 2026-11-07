import { Queue } from "bullmq";
import { defaultRedisConnection } from "./redis";

export const MONITOR_CHECK_QUEUE = "monitor-check";
export const ALERT_EMAIL_QUEUE = "alert-email";
export const ALERT_WEBHOOK_QUEUE = "alert-webhook";

export interface MonitorCheckJobData {
  checkId: string;
  monitorId: string;
}

export interface AlertEmailJobData {
  eventId: string;
  monitorId: string;
  monitorName: string;
  url: string;
  eventType: "DOWN" | "RECOVERY";
  destination: string;
  timestamp: string;
  httpStatus?: number | null;
  failureReason?: string | null;
}

export interface AlertWebhookJobData {
  eventId: string;
  monitorId: string;
  monitorName: string;
  url: string;
  eventType: "DOWN" | "RECOVERY";
  destination: string;
  secret?: string | null;
  timestamp: string;
  httpStatus?: number | null;
  failureReason?: string | null;
}

export const monitorCheckQueue = new Queue<MonitorCheckJobData>(
  MONITOR_CHECK_QUEUE,
  {
    connection: defaultRedisConnection,
    defaultJobOptions: {
      attempts: 1, // Monitoring check failures are not retried at BullMQ level
      removeOnComplete: 1000,
      removeOnFail: 2000,
    },
  }
);

export const alertEmailQueue = new Queue<AlertEmailJobData>(ALERT_EMAIL_QUEUE, {
  connection: defaultRedisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5s, 15s, 45s
    },
    removeOnComplete: 500,
    removeOnFail: 1000,
  },
});

export const alertWebhookQueue = new Queue<AlertWebhookJobData>(
  ALERT_WEBHOOK_QUEUE,
  {
    connection: defaultRedisConnection,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: "fixed",
        delay: 5000,
      },
      removeOnComplete: 500,
      removeOnFail: 1000,
    },
  }
);
