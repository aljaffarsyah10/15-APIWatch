import { z } from "zod";

const BLOCKED_HOSTNAMES = ["localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254"];

export const monitorFormSchema = z.object({
  name: z
    .string()
    .min(1, "Monitor name is required")
    .max(100, "Monitor name cannot exceed 100 characters"),
  url: z
    .string()
    .min(1, "URL is required")
    .url("Must be a valid URL with http:// or https://")
    .refine((val) => {
      try {
        const parsed = new URL(val);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return false;
        }
        if (BLOCKED_HOSTNAMES.includes(parsed.hostname.toLowerCase())) {
          return false;
        }
        // Block 10.x, 192.168.x, 172.16-31.x
        if (/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(parsed.hostname)) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    }, "SSRF Protected: Private network, localhost, and cloud metadata URLs are forbidden"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]),
  intervalSeconds: z.number().min(60, "Minimum interval is 60s").max(3600),
  timeoutMs: z.number().min(1000, "Minimum timeout is 1000ms").max(30000, "Maximum timeout is 30000ms"),
  expectedStatusCodes: z
    .string()
    .min(1, "At least one expected status code is required"),
  requestHeaders: z.string().optional(),
  requestBody: z.string().optional(),
  bodyMatch: z.string().optional(),
});

export type MonitorFormData = z.infer<typeof monitorFormSchema>;
