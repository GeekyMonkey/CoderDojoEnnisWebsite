import { describe, expect, it } from "vitest";
import { profilePasswordFormSchema, profilePasswordSchema, profileQuerySchema, memberProfileUpdateSchema, memberProfileFieldsSchema } from "./MemberProfile";
import type { MemberProfileSnapshot, MemberProfileUpdate } from "./MemberProfile";

const EXPECTED: MemberProfileSnapshot = { login: "sample-mentor", nameFirst: "Example", nameLast: "Mentor", email: null, phone: null, githubLogin: null, scratchName: null, xboxGamertag: null };

describe("own mentor profile contract", (): void => {
	it("normalizes blank optional fields without altering the exact expected snapshot", (): void => {
		const parsed: MemberProfileUpdate = memberProfileUpdateSchema.parse({ fields: { ...EXPECTED, phone: "   " }, expected: { ...EXPECTED, phone: "" } });
		expect(parsed.fields.phone).toBeNull();
		expect(parsed.expected.phone).toBe("");
	});
 it("validates login without adding it to mentor signup fields", (): void => {
  for (const login of ["", "bad login", "bad,login", "x".repeat(101)]) expect(memberProfileUpdateSchema.safeParse({ fields: { ...EXPECTED, login }, expected: EXPECTED }).success).toBe(false);
  expect(memberProfileUpdateSchema.parse({ fields: { ...EXPECTED, login: "  New.Login-1  " }, expected: EXPECTED }).fields.login).toBe("New.Login-1");
  const { login, ...signup } = EXPECTED;
  expect(memberProfileFieldsSchema.safeParse(signup).success).toBe(true);
 });
	it("rejects identity and privilege injection", (): void => {
		expect(memberProfileUpdateSchema.safeParse({ fields: { ...EXPECTED, isMentor: true }, expected: EXPECTED }).success).toBe(false);
		expect(memberProfileUpdateSchema.safeParse({ fields: EXPECTED, expected: EXPECTED, id: "other" }).success).toBe(false);
	});
	it("requires names and validates optional email", (): void => {
		expect(memberProfileUpdateSchema.safeParse({ fields: { ...EXPECTED, nameFirst: " " }, expected: EXPECTED }).success).toBe(false);
		expect(memberProfileUpdateSchema.safeParse({ fields: { ...EXPECTED, email: "invalid" }, expected: EXPECTED }).success).toBe(false);
	});
	it("validates confirmation and rejects unexpected API query fields", (): void => {
		expect(profilePasswordFormSchema.safeParse({ currentPassword: "old-pass", newPassword: "new-pass", confirmation: "different" }).success).toBe(false);
		expect(profilePasswordFormSchema.safeParse({ currentPassword: "old-pass", newPassword: "new-pass", confirmation: "new-pass" }).success).toBe(true);
		expect(profileQuerySchema.safeParse({ memberId: "another-user" }).success).toBe(false);
	});
	it("requires a different password of at least four characters", (): void => {
		expect(profilePasswordSchema.safeParse({ currentPassword: "example", newPassword: "example" }).success).toBe(false);
		expect(profilePasswordSchema.safeParse({ currentPassword: "example", newPassword: "123" }).success).toBe(false);
	});
});
