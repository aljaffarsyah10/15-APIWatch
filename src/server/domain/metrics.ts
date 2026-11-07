import type { CheckStatus } from "@prisma/client";

export interface CheckSummaryMetric {
  status: CheckStatus;
  responseTimeMs: number | null;
}

/**
 * Calculates uptime percentage from an array of check records.
 * Uptime = (Successful Checks / Total Completed Checks) * 100
 * Returns percentage rounded to 2 decimal places (e.g. 99.95).
 */
export function calculateUptimePercentage(checks: { status: CheckStatus }[]): number {
  if (!checks || checks.length === 0) {
    return 100;
  }

  // Filter only completed checks (exclude QUEUED/RUNNING)
  const completedChecks = checks.filter(
    (c) => c.status !== "QUEUED" && c.status !== "RUNNING"
  );

  if (completedChecks.length === 0) {
    return 100;
  }

  const successCount = completedChecks.filter((c) => c.status === "SUCCESS").length;
  const percentage = (successCount / completedChecks.length) * 100;

  return Math.round(percentage * 100) / 100;
}

/**
 * Calculates arithmetic average response time (ms) for checks with valid response times.
 */
export function calculateAverageLatency(
  checks: { responseTimeMs: number | null }[]
): number {
  const validLatencies = checks
    .map((c) => c.responseTimeMs)
    .filter((time): time is number => typeof time === "number" && !isNaN(time) && time >= 0);

  if (validLatencies.length === 0) {
    return 0;
  }

  const sum = validLatencies.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / validLatencies.length);
}

/**
 * Calculates P95 latency (ms).
 */
export function calculateP95Latency(
  checks: { responseTimeMs: number | null }[]
): number {
  const validLatencies = checks
    .map((c) => c.responseTimeMs)
    .filter((time): time is number => typeof time === "number" && !isNaN(time) && time >= 0)
    .sort((a, b) => a - b);

  if (validLatencies.length === 0) {
    return 0;
  }

  const index = Math.ceil(0.95 * validLatencies.length) - 1;
  return validLatencies[Math.max(0, index)];
}
