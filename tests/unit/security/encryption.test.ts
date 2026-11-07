import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "@/lib/security/encryption";

describe("AES-256-GCM Encryption Engine", () => {
  it("should encrypt and successfully decrypt sensitive plaintext", () => {
    const secret = "Bearer secret-api-token-12345!@#$";
    const encrypted = encrypt(secret);

    expect(encrypted).not.toBe(secret);
    expect(encrypted.split(":")).toHaveLength(3); // iv:authTag:ciphertext

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(secret);
  });

  it("should produce different ciphertexts for the same plaintext due to random IV", () => {
    const plaintext = "my-webhook-secret-key";
    const enc1 = encrypt(plaintext);
    const enc2 = encrypt(plaintext);

    expect(enc1).not.toBe(enc2);
    expect(decrypt(enc1)).toBe(plaintext);
    expect(decrypt(enc2)).toBe(plaintext);
  });

  it("should throw an error if encrypted payload has invalid format", () => {
    expect(() => decrypt("invalid-token")).toThrowError(
      "Invalid encrypted format"
    );
  });

  it("should fail authentication if ciphertext is tampered with", () => {
    const secret = "confidential-data";
    const encrypted = encrypt(secret);
    const [iv, authTag, ciphertext] = encrypted.split(":");

    // Tamper with last character of ciphertext
    const tamperedCiphertext =
      ciphertext.slice(0, -1) + (ciphertext.slice(-1) === "a" ? "b" : "a");
    const tamperedToken = `${iv}:${authTag}:${tamperedCiphertext}`;

    expect(() => decrypt(tamperedToken)).toThrow();
  });
});
