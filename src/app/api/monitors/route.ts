import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getServerSession } from "@/lib/auth/session";
import { MonitorService } from "@/server/application/monitors/monitor.service";
import type { HttpMethod, MonitorStatus } from "@prisma/client";

const createMonitorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  url: z.string().url("Must be a valid URL"),
  method: z
    .enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"])
    .default("GET"),
  intervalSeconds: z.number().int().min(10).max(86400).default(60),
  timeoutMs: z.number().int().min(1000).max(30000).default(10000),
  expectedStatusCodes: z.array(z.number().int()).default([200]),
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

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return apiError("Unauthorized", "UNAUTHORIZED", 401);
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const status = (searchParams.get("status") as MonitorStatus) || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const result = await MonitorService.listMonitors(session.user.id, {
      page,
      limit,
      status,
      search,
    });
    return apiSuccess(result.monitors, 200, result.pagination);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return apiError("Unauthorized", "UNAUTHORIZED", 401);
  }

  try {
    const body = await request.json();
    const parsed = createMonitorSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "Validation failed",
        "VALIDATION_ERROR",
        422,
        parsed.error.flatten().fieldErrors
      );
    }

    const created = await MonitorService.createMonitor(session.user.id, {
      name: parsed.data.name,
      url: parsed.data.url,
      method: parsed.data.method as HttpMethod,
      intervalSeconds: parsed.data.intervalSeconds,
      timeoutMs: parsed.data.timeoutMs,
      expectedStatusCodes: parsed.data.expectedStatusCodes,
      requestHeaders: parsed.data.requestHeaders,
      requestBody: parsed.data.requestBody,
      expectedHeaders: parsed.data.expectedHeaders,
      bodyValidation: parsed.data.bodyValidation,
    });

    return apiSuccess(created, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    if (message.startsWith("SSRF_ERROR")) {
      return apiError(message, "SSRF_BLOCKED", 400);
    }
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}
