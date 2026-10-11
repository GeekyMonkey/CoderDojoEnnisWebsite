import { describe, expect, it } from "vitest";
import { profilePasswordFormSchema, profilePasswordSchema, profileQuerySchema, memberProfileUpdateSchema } from "./MemberProfile";
import type { MemberProfileSnapshot, MemberProfileUpdate } from "./MemberProfile";

const EXPECTED: MemberProfileSnapshot = { nameFirst: "Example", nameLast: "Mentor", email: null, phone: null, githubLogin: null, scratchName: null, xboxGamertag: null };

describe("own mentor profile contract", (): void => {
	it("normalizes blank optional fields without altering the exact expected snapshot", (): void => {
		const parsed: MemberProfileUpdate = memberProfileUpdateSchema.parse({ fields: { ...EXPECTED, phone: "   " }, expected: { ...EXPECTED, phone: "" } });
		expect(parsed.fields.phone).toBeNull();
		expect(parsed.expected.phone).toBe("");
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
