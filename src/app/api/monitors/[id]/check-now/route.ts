import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getServerSession } from "@/lib/auth/session";
import { decrypt } from "@/lib/security/encryption";
import { executeHttpRequest } from "@/../worker/src/engine/http-client";
import {
  validateStatusCode,
  validateHeaders,
  validateBody,
  type BodyValidationRule,
} from "@/server/domain/assertions";
import type { CheckStatus, MonitorStatus } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds between manual checks

export async function POST(
  _request: NextRequest,
  context: RouteContext
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return apiError("Unauthorized", "UNAUTHORIZED", 401);
  }

  const { id } = await context.params;

  try {
    const monitor = await prisma.monitor.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!monitor) {
      return apiError("Monitor not found", "NOT_FOUND", 404);
    }

    if (monitor.status === "PAUSED") {
      return apiError(
        "Cannot run manual check on a paused monitor. Please resume it first.",
        "MONITOR_PAUSED",
        400
      );
    }

    // Rate limiting check
    if (monitor.lastCheckedAt) {
      const elapsedMs = Date.now() - new Date(monitor.lastCheckedAt).getTime();
      if (elapsedMs < RATE_LIMIT_WINDOW_MS) {
        const remainingSec = Math.ceil((RATE_LIMIT_WINDOW_MS - elapsedMs) / 1000);
        return apiError(
          `Rate limit exceeded: Please wait ${remainingSec}s before checking again`,
          "RATE_LIMITED",
          429
        );
      }
    }

    // Decrypt custom headers & body if present
    let requestHeaders: Record<string, string> = {};
    if (monitor.requestHeadersEncrypted) {
      try {
        requestHeaders = JSON.parse(decrypt(monitor.requestHeadersEncrypted));
      } catch {
        // Ignore
      }
    }

    let requestBody: string | undefined;
    if (monitor.requestBodyEncrypted) {
      try {
        requestBody = decrypt(monitor.requestBodyEncrypted);
      } catch {
        // Ignore
      }
    }

    // Execute HTTP check
    const httpResult = await executeHttpRequest({
      url: monitor.url,
      method: monitor.method,
      timeoutMs: monitor.timeoutMs,
      headers: requestHeaders,
      body: requestBody,
    });

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
    const check = await prisma.monitorCheck.create({
      data: {
        monitorId: monitor.id,
        status: checkStatus,
        httpStatus: httpResult.httpStatus,
        responseTimeMs: httpResult.responseTimeMs,
        failureReason,
        checkedAt,
      },
    });

    // Update Monitor
    const newStatus: MonitorStatus = checkStatus === "SUCCESS" ? "UP" : "DOWN";
    await prisma.monitor.update({
      where: { id: monitor.id },
      data: {
        status: newStatus,
        lastCheckedAt: checkedAt,
        ...(checkStatus === "SUCCESS" ? { lastSuccessfulAt: checkedAt } : {}),
      },
    });

    return apiSuccess({
      checkId: check.id,
      status: checkStatus,
      httpStatus: httpResult.httpStatus,
      responseTimeMs: httpResult.responseTimeMs,
      failureReason,
      checkedAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}
