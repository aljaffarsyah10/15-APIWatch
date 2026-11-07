import crypto from "crypto";
import { logger } from "../lib/logger";
import type { AlertWebhookJobData } from "../lib/queues";

export async function sendAlertWebhook(
  data: AlertWebhookJobData
): Promise<boolean> {
  const {
    monitorId,
    monitorName,
    url,
    eventType,
    destination,
    secret,
    timestamp,
    httpStatus,
    failureReason,
  } = data;

  const payload = {
    event: eventType === "DOWN" ? "monitor.down" : "monitor.recovered",
    timestamp,
    data: {
      monitorId,
      monitorName,
      url,
      status: eventType === "DOWN" ? "DOWN" : "UP",
      httpStatus,
      failureReason,
    },
  };

  const payloadString = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "APIWatch-Webhook/1.0",
  };

  if (secret) {
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payloadString)
      .digest("hex");
    headers["X-APIWatch-Signature"] = `sha256=${signature}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const res = await fetch(destination, {
      method: "POST",
      headers,
      body: payloadString,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Webhook endpoint responded with status ${res.status}`);
    }

    logger.info("WEBHOOK_SENT", {
      destination,
      status: res.status,
      eventType,
      monitorName,
    });

    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn("WEBHOOK_FAILED", {
      destination,
      error: message,
      eventType,
      monitorName,
    });
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
