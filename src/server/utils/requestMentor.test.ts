import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import { requireRequestMentor } from "./requestMentor";

const mocks = vi.hoisted(() => ({
	header: vi.fn(),
	getUser: vi.fn(),
	maybeSingle: vi.fn(),
}));
vi.mock("h3", async (importOriginal): Promise<unknown> => ({ ...await importOriginal<object>(), getHeader: mocks.header }));
vi.mock("#server/db/DatabaseClient", (): object => ({
	GetSupabaseAdminClient: async (): Promise<object> => ({
		auth: { getUser: mocks.getUser },
		schema: (): object => ({ from: (): object => ({ select: (): object => ({ eq: (): object => ({ maybeSingle: mocks.maybeSingle }) }) }) }),
	}),
}));

const EVENT: H3Event = {} as H3Event;
const ID: string = "21630ded-fbf5-4ddc-9305-0db90c311ea8";

describe("request mentor authorization", (): void => {
	beforeEach((): void => { vi.resetAllMocks(); });
	it("rejects absent bearer authentication before querying the database", async (): Promise<void> => {
		mocks.header.mockReturnValue(undefined);
		await expect(requireRequestMentor(EVENT)).rejects.toMatchObject({ statusCode: 401 });
		expect(mocks.getUser).not.toHaveBeenCalled();
	});
	it("rejects expired or revoked tokens", async (): Promise<void> => {
		mocks.header.mockReturnValue("Bearer expired");
		mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error("expired") });
		await expect(requireRequestMentor(EVENT)).rejects.toMatchObject({ statusCode: 401 });
	});
	it.each([{ is_mentor: false, deleted: false }, { is_mentor: true, deleted: true }])("rejects non-mentor or deleted database records", async (member: { is_mentor: boolean; deleted: boolean }): Promise<void> => {
		mocks.header.mockReturnValue("Bearer valid");
		mocks.getUser.mockResolvedValue({ data: { user: { email: `${ID}@coderdojoennis.com`, email_confirmed_at: "2026-10-10", user_metadata: { isMentor: true } } }, error: null });
		mocks.maybeSingle.mockResolvedValue({ data: { id: ID, ...member }, error: null });
		await expect(requireRequestMentor(EVENT)).rejects.toMatchObject({ statusCode: 403 });
	});
	it("returns the current database mentor identity", async (): Promise<void> => {
		mocks.header.mockReturnValue("Bearer valid");
		mocks.getUser.mockResolvedValue({ data: { user: { email: `${ID}@coderdojoennis.com`, email_confirmed_at: "2026-10-10" } }, error: null });
		mocks.maybeSingle.mockResolvedValue({ data: { id: ID, is_mentor: true, deleted: false }, error: null });
		await expect(requireRequestMentor(EVENT)).resolves.toMatchObject({ id: ID });
	});
});
