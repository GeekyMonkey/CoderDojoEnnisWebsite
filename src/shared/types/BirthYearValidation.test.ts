import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AccountFields, NewMember } from "./MemberMaintenance";
import type { ChildFields } from "./Parent";

type MaintenanceModule = typeof import("./MemberMaintenance");
type ParentModule = typeof import("./Parent");
let maintenance: MaintenanceModule;
let parent: ParentModule;

beforeEach(async (): Promise<void> => {
	vi.resetModules();
	vi.useFakeTimers({ toFake: ["Date"] });
	// Workers initialize modules at epoch zero before the request clock is available.
	vi.setSystemTime(0);
	maintenance = await import("./MemberMaintenance");
	parent = await import("./Parent");
	vi.setSystemTime(new Date("2026-11-14T12:00:00Z"));
});
afterEach((): void => { vi.useRealTimers(); vi.resetModules(); });

/** Supply a Coder account with a birth year that exceeds the startup clock's year. */
function coderAccount(): AccountFields {
	return { ...maintenance.newAccount("coder"), birthYear: 2007, login: "example", fingerprintId: 124, teamId: "21630ded-fbf5-4ddc-9305-0db90c311ea8" };
}

/** Supply the narrow fields editable by a Parent. */
function childFields(birthYear: number | null): ChildFields {
	return { birthYear, login: "example", githubLogin: null, scratchName: null, xboxGamertag: null };
}

describe("birth-year validation after Worker initialization", (): void => {
	it.each<{ field: keyof AccountFields; value: AccountFields[keyof AccountFields] }>([
		{ field: "isMentor", value: true }, { field: "isParent", value: true },
		{ field: "login", value: "changed" }, { field: "fingerprintId", value: 125 },
		{ field: "nfcTag", value: "tag" }, { field: "teamId", value: null },
		{ field: "registeredCurrentTerm", value: false }, { field: "gardaVetted", value: true },
	])("accepts account edits to $field without rejecting unchanged birth year", ({ field, value }): void => {
		const expected: AccountFields = coderAccount();
		expect(maintenance.accountUpdateSchema.safeParse({ fields: { ...expected, [field]: value }, expected }).success).toBe(true);
	});
	it("accepts Coder signup", (): void => {
		const signup: NewMember = { account: coderAccount(), profile: { nameFirst: "Example", nameLast: "Coder", email: null, phone: null, githubLogin: null, scratchName: null, xboxGamertag: null }, password: null, attendanceDate: null };
		expect(maintenance.newMemberSchema.safeParse(signup).success).toBe(true);
	});
	it("accepts Parent child-profile updates", (): void => {
		expect(parent.childUpdateSchema.safeParse({ fields: childFields(2007), expected: childFields(2007) }).success).toBe(true);
	});
	it("accepts the Parent child-profile form", (): void => {
		expect(parent.childFormSchema.safeParse(childFields(2007)).success).toBe(true);
	});
	it("uses the validation-time year, including after New Year", (): void => {
		for (const year of [2026, 2027]) {
			vi.setSystemTime(new Date(`${year}-01-01T00:00:00Z`));
			for (const birthYear of [null, 1900, 2007, year]) {
				expect(maintenance.accountFieldsSchema.safeParse({ ...coderAccount(), birthYear }).success).toBe(true);
				expect(parent.childFieldsSchema.safeParse(childFields(birthYear)).success).toBe(true);
			}
			for (const birthYear of [1899, year + 1, 2007.5, "2007"]) {
				expect(maintenance.accountFieldsSchema.safeParse({ ...coderAccount(), birthYear }).success).toBe(false);
				expect(parent.childFieldsSchema.safeParse({ ...childFields(null), birthYear }).success).toBe(false);
			}
		}
	});
});
