import { describe, expect, it } from "vitest";
import vectors from "./legacyPasswords.vectors.json";
import { importedLegacyHash, legacyPasswordHash, matchesLegacyPassword } from "./legacyPasswords";
import { loginRequestSchema } from "#shared/validation/AuthSchemas";

describe("legacy .NET password compatibility", (): void => {
 it.each(vectors)("matches the .NET ASCII/MD5/UTF8 vector for $password", ({ password, hash }: { password: string; hash: string }): void => {
  expect(Buffer.from(legacyPasswordHash(password), "utf8").toString("base64")).toBe(hash);
  expect(matchesLegacyPassword(password, importedLegacyHash(Buffer.from(hash, "base64").toString("utf8")))).toBe(true);
 });
 it("does not normalize case or spaces in legacy passwords", (): void => {
  const stored: string = importedLegacyHash(legacyPasswordHash(" Secret "))!;
  expect(matchesLegacyPassword("secret", stored)).toBe(false);
  expect(matchesLegacyPassword("Secret", stored)).toBe(false);
  expect(loginRequestSchema.parse({ username: "user", password: " Secret " }).password).toBe(" Secret ");
 });
 it("encodes null characters safely and never treats current hashes as legacy", (): void => {
  expect(importedLegacyHash("a\u0000b")).not.toContain("\u0000");
  expect(importedLegacyHash(null)).toBeNull();
  expect(matchesLegacyPassword("1234", "current-hash")).toBe(false);
  expect(matchesLegacyPassword("wrong", importedLegacyHash(legacyPasswordHash("1234")))).toBe(false);
 });
});
