import { describe, it, expect } from "vitest";
import {
  calculateUptimePercentage,
  calculateAverageLatency,
  calculateP95Latency,
} from "@/server/domain/metrics";

describe("Domain Metrics Calculators", () => {
  describe("calculateUptimePercentage", () => {
    it("should return 100% when there are no checks", () => {
      expect(calculateUptimePercentage([])).toBe(100);
    });

    it("should calculate 100% when all checks are SUCCESS", () => {
      const checks = [
        { status: "SUCCESS" as const },
        { status: "SUCCESS" as const },
        { status: "SUCCESS" as const },
      ];
      expect(calculateUptimePercentage(checks)).toBe(100);
    });

    it("should calculate accurate uptime percentage for mixed checks", () => {
      const checks = [
        { status: "SUCCESS" as const },
        { status: "SUCCESS" as const },
        { status: "SUCCESS" as const },
        { status: "FAILURE" as const }, // 3 out of 4 = 75%
      ];
      expect(calculateUptimePercentage(checks)).toBe(75);
    });

    it("should round to 2 decimal places", () => {
      const checks = [
        { status: "SUCCESS" as const },
        { status: "SUCCESS" as const },
        { status: "FAILURE" as const }, // 2/3 = 66.67%
      ];
      expect(calculateUptimePercentage(checks)).toBe(66.67);
    });

    it("should ignore non-completed checks (QUEUED and RUNNING)", () => {
      const checks = [
        { status: "SUCCESS" as const },
        { status: "QUEUED" as const },
        { status: "RUNNING" as const },
      ];
      expect(calculateUptimePercentage(checks)).toBe(100);
    });
  });

  describe("calculateAverageLatency", () => {
    it("should return 0 when no checks or all nulls", () => {
      expect(calculateAverageLatency([])).toBe(0);
      expect(calculateAverageLatency([{ responseTimeMs: null }])).toBe(0);
    });

    it("should compute accurate arithmetic mean", () => {
      const checks = [
        { responseTimeMs: 100 },
        { responseTimeMs: 200 },
        { responseTimeMs: 300 },
      ];
      expect(calculateAverageLatency(checks)).toBe(200);
    });

    it("should ignore null and negative latencies", () => {
      const checks = [
        { responseTimeMs: 150 },
        { responseTimeMs: null },
        { responseTimeMs: 250 },
      ];
      expect(calculateAverageLatency(checks)).toBe(200);
    });
  });

  describe("calculateP95Latency", () => {
    it("should return 0 for empty array", () => {
      expect(calculateP95Latency([])).toBe(0);
    });

    it("should return correct 95th percentile", () => {
      // 20 items from 10ms to 200ms
      const checks = Array.from({ length: 20 }, (_, i) => ({
        responseTimeMs: (i + 1) * 10,
      }));
      // 95th percentile of 20 elements is element at index 18 (190)
      expect(calculateP95Latency(checks)).toBe(190);
    });
  });
});
