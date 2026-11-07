import { describe, it, expect } from "vitest";
import { sanitizeCsvField } from "@/app/api/monitors/[id]/export/route";

describe("CSV Export Formula Injection Protection (CWE-1236)", () => {
  it("should escape formula starting with '=' to prevent arbitrary Excel command execution", () => {
    const malicious = '=cmd|"/C calc"!A0';
    const escaped = sanitizeCsvField(malicious);
    expect(escaped).toBe('"\'=cmd|""/C calc""!A0"');
    expect(escaped.startsWith('"\'=')).toBe(true);
  });

  it("should escape formula starting with '+' or '-'", () => {
    expect(sanitizeCsvField("+123456").startsWith('"\'+\'')).toBe(false);
    expect(sanitizeCsvField("+123456")).toBe('"\' +123456"'.replace(" ", ""));
    expect(sanitizeCsvField("-2+5")).toBe('"\' -2+5"'.replace(" ", ""));
  });

  it("should escape formula starting with '@'", () => {
    const atFormula = "@SUM(1+1)";
    const result = sanitizeCsvField(atFormula);
    expect(result).toBe('"\'@SUM(1+1)"');
  });

  it("should escape internal quotes correctly", () => {
    const textWithQuotes = 'Response was "OK" with code 200';
    const result = sanitizeCsvField(textWithQuotes);
    expect(result).toBe('"Response was ""OK"" with code 200"');
  });

  it("should safely handle null and undefined", () => {
    expect(sanitizeCsvField(null)).toBe('""');
    expect(sanitizeCsvField(undefined)).toBe('""');
  });
});
