import { describe, it, expect } from "vitest";
import { isPrivateOrBlockedIp, validateTargetUrl } from "@/lib/security/ssrf";

describe("SSRF Protection Engine", () => {
  describe("isPrivateOrBlockedIp", () => {
    it("should identify IPv4 loopback as blocked", () => {
      expect(isPrivateOrBlockedIp("127.0.0.1")).toBe(true);
      expect(isPrivateOrBlockedIp("127.0.0.254")).toBe(true);
    });

    it("should identify IPv6 loopback as blocked", () => {
      expect(isPrivateOrBlockedIp("::1")).toBe(true);
    });

    it("should identify RFC 1918 private subnets as blocked", () => {
      // 10.0.0.0/8
      expect(isPrivateOrBlockedIp("10.0.0.1")).toBe(true);
      expect(isPrivateOrBlockedIp("10.255.255.254")).toBe(true);

      // 172.16.0.0/12
      expect(isPrivateOrBlockedIp("172.16.0.1")).toBe(true);
      expect(isPrivateOrBlockedIp("172.31.255.254")).toBe(true);

      // 192.168.0.0/16
      expect(isPrivateOrBlockedIp("192.168.0.1")).toBe(true);
      expect(isPrivateOrBlockedIp("192.168.1.100")).toBe(true);
    });

    it("should identify AWS/Cloud metadata address as blocked", () => {
      expect(isPrivateOrBlockedIp("169.254.169.254")).toBe(true);
      expect(isPrivateOrBlockedIp("169.254.1.1")).toBe(true);
    });

    it("should allow valid public IP addresses", () => {
      expect(isPrivateOrBlockedIp("8.8.8.8")).toBe(false);
      expect(isPrivateOrBlockedIp("1.1.1.1")).toBe(false);
      expect(isPrivateOrBlockedIp("93.184.216.34")).toBe(false); // example.com
    });
  });

  describe("validateTargetUrl", () => {
    it("should reject non-HTTP/HTTPS protocols", async () => {
      const ftpResult = await validateTargetUrl("ftp://example.com/file.txt");
      expect(ftpResult.isSafe).toBe(false);
      expect(ftpResult.error).toContain("DISALLOWED_PROTOCOL");

      const fileResult = await validateTargetUrl("file:///etc/passwd");
      expect(fileResult.isSafe).toBe(false);

      const gopherResult = await validateTargetUrl("gopher://example.com");
      expect(gopherResult.isSafe).toBe(false);
    });

    it("should reject local/internal hostnames without DNS query", async () => {
      const localhost = await validateTargetUrl("http://localhost:3000/api");
      expect(localhost.isSafe).toBe(false);
      expect(localhost.error).toContain("SSRF_BLOCKED");

      const internalHost = await validateTargetUrl("http://service.internal/status");
      expect(internalHost.isSafe).toBe(false);

      const localHost = await validateTargetUrl("http://mydev.local");
      expect(localHost.isSafe).toBe(false);
    });

    it("should reject URLs pointing directly to private IPs", async () => {
      const res1 = await validateTargetUrl("http://127.0.0.1/health");
      expect(res1.isSafe).toBe(false);
      expect(res1.error).toContain("SSRF_BLOCKED");

      const res2 = await validateTargetUrl("http://192.168.1.1/admin");
      expect(res2.isSafe).toBe(false);
      expect(res2.error).toContain("SSRF_BLOCKED");

      const res3 = await validateTargetUrl("http://169.254.169.254/latest/meta-data/");
      expect(res3.isSafe).toBe(false);
      expect(res3.error).toContain("SSRF_BLOCKED");
    });

    it("should accept safe public URLs", async () => {
      const res = await validateTargetUrl("https://example.com");
      expect(res.isSafe).toBe(true);
      expect(res.resolvedIps.length).toBeGreaterThan(0);
      expect(res.pinnedIp).toBeDefined();
    });
  });
});
