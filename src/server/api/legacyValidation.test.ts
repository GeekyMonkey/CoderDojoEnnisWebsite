import { afterEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import type { ApiResponse } from "#shared/types/ApiResponse";
import { requestFailureMessage } from "#shared/utils/RequestFailure";
import login from "./Auth/Login.post";
import nfc from "./Auth/LoginNfcTag.post";
import password from "./Auth/PasswordChange.post";
import attendance from "./MemberAttendance/SetPresent.post";

vi.mock("h3", async (original): Promise<object> => ({ ...await original<object>(), readBody: async (): Promise<unknown> => ({ password: { value: "never-expose-this" } }) }));
vi.mock("#server/services/AuthService", (): object => ({ AuthService: vi.fn(), AuthServiceError: class extends Error {} }));
vi.mock("#server/db/MembersData", (): object => ({ MembersData: {} }));
vi.mock("#server/db/MemberAttendancesData", (): object => ({ MemberAttendancesData: {} }));
afterEach((): void => { vi.clearAllMocks(); });

describe("legacy API validation envelopes", (): void => {
	it.each([
		{ name: "login", handler: login, field: "username" },
		{ name: "NFC login", handler: nfc, field: "nfcTag" },
		{ name: "password change", handler: password, field: "oldPassword" },
		{ name: "attendance", handler: attendance, field: "sessionDate" },
	])("returns structured field details for $name", async ({ handler, field }): Promise<void> => {
		const result: ApiResponse<unknown> = await handler({} as H3Event);
		expect(result.success).toBe(false);
		if (result.success) throw new Error("Expected request rejection");
		expect(result.validationErrors).toEqual(expect.arrayContaining([expect.objectContaining({ name: field, message: expect.any(String) })]));
		expect(JSON.stringify(result)).not.toContain("never-expose-this");
		expect(requestFailureMessage(result)).not.toBeNull();
	});
});
