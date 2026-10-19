import { describe, expect, it } from "vitest";
import { profileFieldsForRoles, type ProfileField } from "./profileFields";

describe("assigned profile role fields", (): void => {
	it("includes parent contact fields and coder handles for combined roles", (): void => {
		const fields: string[] = profileFieldsForRoles({ isNinja: true, isParent: true, isMentor: false }).map((field: ProfileField): string => field.key);
		expect(fields).toEqual(["nameFirst", "nameLast", "email", "phone", "githubLogin", "scratchName", "xboxGamertag"]);
		expect(new Set(fields).size).toBe(fields.length);
	});
	it("shows coder handles without adult contact fields for a coder", (): void => {
		const fields: string[] = profileFieldsForRoles({ isNinja: true, isParent: false, isMentor: false }).map((field: ProfileField): string => field.key);
		expect(fields).toContain("scratchName");
		expect(fields).not.toContain("email");
		expect(fields).not.toContain("phone");
	});
	it("shows contact fields for a parent", (): void => {
		const fields: string[] = profileFieldsForRoles({ isNinja: false, isParent: true, isMentor: false }).map((field: ProfileField): string => field.key);
		expect(fields).toEqual(["nameFirst", "nameLast", "email", "phone"]);
	});
	it("retains mentor contact details and external handles", (): void => {
		const fields: string[] = profileFieldsForRoles({ isNinja: false, isParent: false, isMentor: true }).map((field: ProfileField): string => field.key);
		expect(fields).toContain("email");
		expect(fields).toContain("githubLogin");
	});
});
