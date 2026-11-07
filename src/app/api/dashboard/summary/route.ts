import { apiError, apiSuccess } from "@/lib/api/response";
import { getServerSession } from "@/lib/auth/session";
import { DashboardService } from "@/server/application/dashboard/dashboard.service";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return apiError("Unauthorized: Please log in to access this resource", "UNAUTHORIZED", 401);
  }

  try {
    const summary = await DashboardService.getSummary(session.user.id);
    return apiSuccess(summary);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}
