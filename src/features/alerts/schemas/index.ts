import { z } from "zod";

export const alertChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required").max(60),
  type: z.enum(["EMAIL", "WEBHOOK"]),
  destination: z.string().min(1, "Destination is required"),
  secret: z.string().optional(),
}).refine((data) => {
  if (data.type === "EMAIL") {
    return z.string().email().safeParse(data.destination).success;
  }
  if (data.type === "WEBHOOK") {
    return z.string().url().safeParse(data.destination).success;
  }
  return false;
}, {
  message: "Invalid destination format for the selected channel type",
  path: ["destination"],
});

export type AlertChannelFormData = z.infer<typeof alertChannelSchema>;
