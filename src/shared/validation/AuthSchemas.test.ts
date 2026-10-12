import { describe, expect, it } from "vitest";
import { loginRequestSchema, passwordChangeRequestSchema, passwordSchema } from "./AuthSchemas";

// Preserve the accepted four-character password minimum at request boundaries.
describe("accepted password minimum", (): void => {
 it.each(["", "abc", " abc "])("rejects short trimmed password %j", (password: string): void => {
  expect(passwordSchema.safeParse(password).success).toBe(false);
  expect(loginRequestSchema.safeParse({ username: "coder", password }).success).toBe(false);
 });
 it("accepts four characters for login and password changes", (): void => {
  expect(loginRequestSchema.safeParse({ username: "coder", password: " abcd " }).success).toBe(true);
  expect(passwordChangeRequestSchema.safeParse({ username: "coder", oldPassword: "abcd", newPassword: "efgh" }).success).toBe(true);
 });
 it("rejects shorter old or new passwords", (): void => {
  expect(passwordChangeRequestSchema.safeParse({ username: "coder", oldPassword: "abc", newPassword: "efgh" }).success).toBe(false);
  expect(passwordChangeRequestSchema.safeParse({ username: "coder", oldPassword: "abcd", newPassword: "efg" }).success).toBe(false);
 });
});
