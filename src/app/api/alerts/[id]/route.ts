import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getServerSession } from "@/lib/auth/session";
import { AlertService } from "@/server/application/alerts/alert.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateAlertSchema = z.object({
  destination: z.string().min(1).optional(),
  secret: z.string().optional(),
  isEnabled: z.boolean().optional(),
});

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
    const parsed = updateAlertSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "Validation failed",
        "VALIDATION_ERROR",
        422,
        parsed.error.flatten().fieldErrors
      );
    }

    const updated = await AlertService.updateChannel(
      session.user.id,
      id,
      parsed.data
    );

    return apiSuccess(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    if (message.startsWith("NOT_FOUND")) {
      return apiError(message, "NOT_FOUND", 404);
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
    const result = await AlertService.deleteChannel(session.user.id, id);
    return apiSuccess(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    if (message.startsWith("NOT_FOUND")) {
      return apiError(message, "NOT_FOUND", 404);
    }
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}
