import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getServerSession } from "@/lib/auth/session";
import { MonitorService } from "@/server/application/monitors/monitor.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return apiError("Unauthorized", "UNAUTHORIZED", 401);
  }

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const result = await MonitorService.getMonitorChecks(
      session.user.id,
      id,
      page,
      limit
    );
    return apiSuccess(result.checks, 200, result.pagination);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    if (message.startsWith("NOT_FOUND")) {
      return apiError(message, "NOT_FOUND", 404);
    }
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}
