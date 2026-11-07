import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getServerSession } from "@/lib/auth/session";
import { AlertService } from "@/server/application/alerts/alert.service";
import type { AlertChannelType } from "@prisma/client";

const createAlertSchema = z.object({
  type: z.enum(["EMAIL", "WEBHOOK"]),
  destination: z.string().min(1, "Destination is required"),
  secret: z.string().optional(),
  isEnabled: z.boolean().default(true),
});

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return apiError("Unauthorized", "UNAUTHORIZED", 401);
  }

  try {
    const channels = await AlertService.listChannels(session.user.id);
    return apiSuccess(channels);
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
    const parsed = createAlertSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "Validation failed",
        "VALIDATION_ERROR",
        422,
        parsed.error.flatten().fieldErrors
      );
    }

    // Basic email format check if type is EMAIL
    if (parsed.data.type === "EMAIL") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parsed.data.destination)) {
        return apiError("Invalid email address", "VALIDATION_ERROR", 422);
      }
    }

    const created = await AlertService.createChannel(session.user.id, {
      type: parsed.data.type as AlertChannelType,
      destination: parsed.data.destination,
      secret: parsed.data.secret,
      isEnabled: parsed.data.isEnabled,
    });

    return apiSuccess(created, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}
