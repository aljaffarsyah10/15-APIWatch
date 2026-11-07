import { Worker, type Job } from "bullmq";
import prisma from "@/lib/db/prisma";
import { decrypt } from "@/lib/security/encryption";
import {
  validateStatusCode,
  validateHeaders,
  validateBody,
  type BodyValidationRule,
} from "@/server/domain/assertions";
import { executeHttpRequest } from "../engine/http-client";
import { logger } from "../lib/logger";
import {
  MONITOR_CHECK_QUEUE,
  alertEmailQueue,
  alertWebhookQueue,
  type MonitorCheckJobData,
} from "../lib/queues";
import { defaultRedisConnection } from "../lib/redis";
import type { CheckStatus, MonitorStatus, Prisma } from "@prisma/client";

const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || "10", 10);

export function createCheckWorker(): Worker<MonitorCheckJobData> {
  return new Worker<MonitorCheckJobData>(
    MONITOR_CHECK_QUEUE,
    async (job: Job<MonitorCheckJobData>) => {
      const { checkId, monitorId } = job.data;

      // Update check status to RUNNING
      await prisma.monitorCheck.update({
        where: { id: checkId },
        data: { status: "RUNNING" },
      });

      const monitor = await prisma.monitor.findUnique({
        where: { id: monitorId },
        include: {
          user: {
            include: {
              alertChannels: {
                where: { isEnabled: true },
              },
            },
          },
        },
      });

      if (!monitor || !monitor.isActive || monitor.status === "PAUSED") {
        logger.info("CHECK_SKIPPED_INACTIVE", { monitorId, checkId });
        return;
      }

      // Decrypt request headers and body if present
      let requestHeaders: Record<string, string> = {};
      if (monitor.requestHeadersEncrypted) {
        try {
          const decrypted = decrypt(monitor.requestHeadersEncrypted);
          requestHeaders = JSON.parse(decrypted);
        } catch (err: unknown) {
          logger.warn("DECRYPT_HEADERS_FAILED", { monitorId, error: String(err) });
        }
      }

      let requestBody: string | undefined;
      if (monitor.requestBodyEncrypted) {
        try {
          requestBody = decrypt(monitor.requestBodyEncrypted);
        } catch (err: unknown) {
          logger.warn("DECRYPT_BODY_FAILED", { monitorId, error: String(err) });
        }
      }

      // Execute HTTP request
      const httpResult = await executeHttpRequest({
        url: monitor.url,
        method: monitor.method,
        timeoutMs: monitor.timeoutMs,
        headers: requestHeaders,
        body: requestBody,
      });

      // Classify check result
      let checkStatus: CheckStatus = "SUCCESS";
      let failureReason: string | null = null;
      const validationDetails: Record<string, unknown> = {};

      if (httpResult.isSsrfBlocked) {
        checkStatus = "VALIDATION_ERROR";
        failureReason = httpResult.error || "SSRF Blocked";
      } else if (httpResult.isTimeout) {
        checkStatus = "TIMEOUT";
        failureReason = httpResult.error || "Timeout exceeded";
      } else if (httpResult.isNetworkError) {
        checkStatus = "NETWORK_ERROR";
        failureReason = httpResult.error || "Network error";
      } else if (httpResult.httpStatus !== null) {
        // Assertions validation
        const expectedStatuses = Array.isArray(monitor.expectedStatusCodes)
          ? (monitor.expectedStatusCodes as number[])
          : [200];

        const statusValidation = validateStatusCode(
          httpResult.httpStatus,
          expectedStatuses
        );

        if (!statusValidation.passed) {
          checkStatus = "FAILURE";
          failureReason = statusValidation.error || "Status code assertion failed";
          validationDetails.statusAssertion = statusValidation;
        }

        // Header assertion
        if (checkStatus === "SUCCESS" && monitor.expectedHeaders) {
          const headerValidation = validateHeaders(
            httpResult.responseHeaders,
            monitor.expectedHeaders as Record<string, string>
          );
          if (!headerValidation.passed) {
            checkStatus = "VALIDATION_ERROR";
            failureReason = headerValidation.errors.join("; ");
            validationDetails.headerAssertion = headerValidation;
          }
        }

        // Body assertion
        if (checkStatus === "SUCCESS" && monitor.bodyValidation) {
          const bodyValidation = validateBody(
            httpResult.responseBody,
            monitor.bodyValidation as unknown as BodyValidationRule
          );
          if (!bodyValidation.passed) {
            checkStatus = "VALIDATION_ERROR";
            failureReason = bodyValidation.error || "Body assertion failed";
            validationDetails.bodyAssertion = bodyValidation;
          }
        }
      }

      const checkedAt = new Date();

      // Persist MonitorCheck
      await prisma.monitorCheck.update({
        where: { id: checkId },
        data: {
          status: checkStatus,
          httpStatus: httpResult.httpStatus,
          responseTimeMs: httpResult.responseTimeMs,
          failureReason,
          validationResults:
            Object.keys(validationDetails).length > 0
              ? (validationDetails as unknown as Prisma.InputJsonValue)
              : undefined,
          checkedAt,
        },
      });

      // Evaluate Monitor status transition
      const previousStatus = monitor.status;
      let newMonitorStatus: MonitorStatus = previousStatus;

      if (checkStatus === "SUCCESS") {
        newMonitorStatus = "UP";
      } else {
        newMonitorStatus = "DOWN";
      }

      const isTransition =
        previousStatus !== "UNKNOWN" &&
        previousStatus !== newMonitorStatus &&
        (newMonitorStatus === "UP" || newMonitorStatus === "DOWN");

      // Update Monitor status & timestamps
      await prisma.monitor.update({
        where: { id: monitorId },
        data: {
          status: newMonitorStatus,
          lastCheckedAt: checkedAt,
          ...(checkStatus === "SUCCESS" ? { lastSuccessfulAt: checkedAt } : {}),
        },
      });

      logger.info("CHECK_COMPLETED", {
        monitorId,
        checkId,
        status: checkStatus,
        httpStatus: httpResult.httpStatus,
        durationMs: httpResult.responseTimeMs,
        transition: isTransition ? `${previousStatus}->${newMonitorStatus}` : "NONE",
      });

      // Trigger alerts if status transitioned
      if (isTransition) {
        const eventType = newMonitorStatus === "DOWN" ? "DOWN" : "RECOVERY";
        const alertChannels = monitor.user.alertChannels;

        for (const channel of alertChannels) {
          try {
            const event = await prisma.alertEvent.create({
              data: {
                monitorId: monitor.id,
                channelId: channel.id,
                eventType,
                deliveryStatus: "PENDING",
              },
            });

            if (channel.type === "EMAIL") {
              await alertEmailQueue.add(`email-${event.id}`, {
                eventId: event.id,
                monitorId: monitor.id,
                monitorName: monitor.name,
                url: monitor.url,
                eventType,
                destination: channel.destination,
                timestamp: checkedAt.toISOString(),
                httpStatus: httpResult.httpStatus,
                failureReason,
              });
            } else if (channel.type === "WEBHOOK") {
              let webhookSecret: string | null = null;
              if (channel.secretEncrypted) {
                try {
                  webhookSecret = decrypt(channel.secretEncrypted);
                } catch {
                  // Ignore
                }
              }

              await alertWebhookQueue.add(`webhook-${event.id}`, {
                eventId: event.id,
                monitorId: monitor.id,
                monitorName: monitor.name,
                url: monitor.url,
                eventType,
                destination: channel.destination,
                secret: webhookSecret,
                timestamp: checkedAt.toISOString(),
                httpStatus: httpResult.httpStatus,
                failureReason,
              });
            }
          } catch (alertErr: unknown) {
            const msg = alertErr instanceof Error ? alertErr.message : String(alertErr);
            logger.error("ALERT_ENQUEUE_FAILED", {
              channelId: channel.id,
              error: msg,
            });
          }
        }
      }
    },
    {
      connection: defaultRedisConnection,
      concurrency: CONCURRENCY,
    }
  );
}
