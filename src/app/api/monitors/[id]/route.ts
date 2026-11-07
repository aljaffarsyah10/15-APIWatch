import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getServerSession } from "@/lib/auth/session";
import { MonitorService } from "@/server/application/monitors/monitor.service";
import type { HttpMethod } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateMonitorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  method: z
    .enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"])
    .optional(),
  intervalSeconds: z.number().int().min(10).max(86400).optional(),
  timeoutMs: z.number().int().min(1000).max(30000).optional(),
  expectedStatusCodes: z.array(z.number().int()).optional(),
  requestHeaders: z.record(z.string(), z.string()).optional(),
  requestBody: z.string().optional(),
  expectedHeaders: z.record(z.string(), z.string()).optional(),
  bodyValidation: z
    .object({
      type: z.enum(["contains", "equals", "json_path"]),
      target: z.string().optional(),
      expectedValue: z.string().optional(),
    })
    .optional(),
});

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return apiError("Unauthorized", "UNAUTHORIZED", 401);
  }

  const { id } = await context.params;

  try {
    const monitor = await MonitorService.getMonitorById(session.user.id, id);
    if (!monitor) {
      return apiError("Monitor not found", "NOT_FOUND", 404);
    }
    return apiSuccess(monitor);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return apiError("Unauthorized", "UNAUTHORIZED", 401);
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateMonitorSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "Validation failed",
        "VALIDATION_ERROR",
        422,
        parsed.error.flatten().fieldErrors
      );
    }

    const updated = await MonitorService.updateMonitor(session.user.id, id, {
      ...parsed.data,
      method: parsed.data.method as HttpMethod | undefined,
    });

    return apiSuccess(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    if (message.startsWith("NOT_FOUND")) {
      return apiError(message, "NOT_FOUND", 404);
    }
    if (message.startsWith("SSRF_ERROR")) {
      return apiError(message, "SSRF_BLOCKED", 400);
    }
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return apiError("Unauthorized", "UNAUTHORIZED", 401);
  }

  const { id } = await context.params;

  try {
    const result = await MonitorService.deleteMonitor(session.user.id, id);
    return apiSuccess(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    if (message.startsWith("NOT_FOUND")) {
      return apiError(message, "NOT_FOUND", 404);
    }
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}
