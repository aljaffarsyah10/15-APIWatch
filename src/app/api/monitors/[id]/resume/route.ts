import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getServerSession } from "@/lib/auth/session";
import { MonitorService } from "@/server/application/monitors/monitor.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

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
    const updated = await MonitorService.resumeMonitor(session.user.id, id);
    return apiSuccess(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    if (message.startsWith("NOT_FOUND")) {
      return apiError(message, "NOT_FOUND", 404);
    }
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}
