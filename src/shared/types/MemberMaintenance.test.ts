import { describe, expect, it } from "vitest";
import { accountFieldsSchema, newAccount, relationshipInputSchema, passwordResetSchema } from "./MemberMaintenance";

describe("member maintenance boundaries", (): void => {
	it("rejects role-free accounts and injected fields", (): void => {
		expect(accountFieldsSchema.safeParse({ ...newAccount("coder"), isNinja: false }).success).toBe(false);
		expect(accountFieldsSchema.safeParse({ ...newAccount("parent"), passwordHash: "injected" }).success).toBe(false);
	});
	it("rejects invalid account identifiers and birth years", (): void => {
		expect(accountFieldsSchema.safeParse({ ...newAccount("coder"), fingerprintId: -1 }).success).toBe(false);
		expect(accountFieldsSchema.safeParse({ ...newAccount("coder"), birthYear: new Date().getFullYear() + 1 }).success).toBe(false);
		expect(accountFieldsSchema.safeParse({ ...newAccount("coder"), teamId: "missing" }).success).toBe(false);
	});
	it("rejects a self relationship and mismatched passwords", (): void => {
		const id: string = "21630ded-fbf5-4ddc-9305-0db90c311ea8";
		expect(relationshipInputSchema.safeParse({ memberId: id, parentId: id }).success).toBe(false);
		expect(passwordResetSchema.safeParse({ newPassword: "abcd", confirmation: "different" }).success).toBe(false);
	});
});
