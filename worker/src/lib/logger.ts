type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEYS = [
  "authorization",
  "cookie",
  "set-cookie",
  "api-key",
  "x-api-key",
  "token",
  "secret",
  "password",
];

function redactSensitiveData(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEYS.some((sensitive) =>
      key.toLowerCase().includes(sensitive)
    );
    if (isSensitive) {
      result[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      result[key] = redactSensitiveData(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export function log(
  level: LogLevel,
  event: string,
  context?: Record<string, unknown>
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...(context ? { context: redactSensitiveData(context) } : {}),
  };

  const output = JSON.stringify(logEntry);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  debug: (event: string, context?: Record<string, unknown>) =>
    log("debug", event, context),
  info: (event: string, context?: Record<string, unknown>) =>
    log("info", event, context),
  warn: (event: string, context?: Record<string, unknown>) =>
    log("warn", event, context),
  error: (event: string, context?: Record<string, unknown>) =>
    log("error", event, context),
};
