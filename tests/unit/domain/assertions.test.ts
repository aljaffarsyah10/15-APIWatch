import { describe, it, expect } from "vitest";
import {
  validateStatusCode,
  validateHeaders,
  validateBody,
} from "@/server/domain/assertions";

describe("Assertion Engine", () => {
  describe("validateStatusCode", () => {
    it("should pass when status code is within expected array", () => {
      const result = validateStatusCode(200, [200, 201]);
      expect(result.passed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should fail when status code is not within expected array", () => {
      const result = validateStatusCode(500, [200, 204]);
      expect(result.passed).toBe(false);
      expect(result.error).toContain("500");
    });

    it("should default to 2xx when expected statuses array is empty", () => {
      expect(validateStatusCode(200, []).passed).toBe(true);
      expect(validateStatusCode(204, []).passed).toBe(true);
      expect(validateStatusCode(404, []).passed).toBe(false);
    });
  });

  describe("validateHeaders", () => {
    it("should match headers case-insensitively", () => {
      const actualHeaders = {
        "content-type": "application/json; charset=utf-8",
        server: "nginx",
      };

      const expectedHeaders = {
        "Content-Type": "application/json; charset=utf-8",
        Server: "nginx",
      };

      const result = validateHeaders(actualHeaders, expectedHeaders);
      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should report missing expected header", () => {
      const actualHeaders = {
        server: "caddy",
      };

      const expectedHeaders = {
        "x-custom-auth": "secret-val",
      };

      const result = validateHeaders(actualHeaders, expectedHeaders);
      expect(result.passed).toBe(false);
      expect(result.errors[0]).toContain("x-custom-auth");
    });
  });

  describe("validateBody", () => {
    it("should validate substring contains rule", () => {
      const body = '{"status":"ok","message":"service healthy"}';
      expect(
        validateBody(body, { type: "contains", target: "service healthy" })
          .passed
      ).toBe(true);

      expect(
        validateBody(body, { type: "contains", target: "fatal error" }).passed
      ).toBe(false);
    });

    it("should validate strict equals rule", () => {
      expect(
        validateBody("PONG", { type: "equals", expectedValue: "PONG" }).passed
      ).toBe(true);

      expect(
        validateBody("OK", { type: "equals", expectedValue: "PONG" }).passed
      ).toBe(false);
    });

    it("should evaluate JSON path equality accurately", () => {
      const jsonBody = JSON.stringify({
        data: {
          user: {
            id: 123,
            status: "active",
          },
        },
      });

      const passResult = validateBody(jsonBody, {
        type: "json_path",
        target: "data.user.status",
        expectedValue: "active",
      });
      expect(passResult.passed).toBe(true);

      const failResult = validateBody(jsonBody, {
        type: "json_path",
        target: "data.user.status",
        expectedValue: "suspended",
      });
      expect(failResult.passed).toBe(false);
    });

    it("should fail gracefully if response is not valid JSON when evaluating json_path", () => {
      const nonJson = "<html><body>502 Bad Gateway</body></html>";
      const result = validateBody(nonJson, {
        type: "json_path",
        target: "data.status",
        expectedValue: "healthy",
      });

      expect(result.passed).toBe(false);
      expect(result.error).toContain("not valid JSON");
    });
  });
});
