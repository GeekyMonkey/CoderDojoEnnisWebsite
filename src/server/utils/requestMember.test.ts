import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import { requireRequestMember } from "./requestMember";

const mocks = vi.hoisted(() => ({
	header: vi.fn(),
	getUser: vi.fn(),
	maybeSingle: vi.fn(),
}));
vi.mock("h3", async (importOriginal): Promise<unknown> => ({ ...await importOriginal<object>(), getHeader: mocks.header }));
vi.mock("#shared/types/models/MemberModel", (): object => ({
	memberFromRecord: (member: { id: string; is_mentor: boolean; deleted: boolean }): object => ({ id: member.id, isMentor: member.is_mentor, deleted: member.deleted }),
}));
vi.mock("#server/db/DatabaseClient", (): object => ({
	GetSupabaseAdminClient: async (): Promise<object> => ({
		auth: { getUser: mocks.getUser },
		schema: (): object => ({ from: (): object => ({ select: (): object => ({ eq: (): object => ({ maybeSingle: mocks.maybeSingle }) }) }) }),
	}),
}));

const EVENT: H3Event = {} as H3Event;
const ID: string = "21630ded-fbf5-4ddc-9305-0db90c311ea8";

describe("request member authorization", (): void => {
	beforeEach((): void => { vi.resetAllMocks(); });
	it("rejects absent bearer authentication before querying the database", async (): Promise<void> => {
		mocks.header.mockReturnValue(undefined);
		await expect(requireRequestMember(EVENT)).rejects.toMatchObject({ statusCode: 401 });
		expect(mocks.getUser).not.toHaveBeenCalled();
	});
	it("rejects expired or revoked tokens", async (): Promise<void> => {
		mocks.header.mockReturnValue("Bearer expired");
		mocks.getUser.mockResolvedValue({ data: { user: null }, error: { status: 403, code: "session_not_found" } });
		await expect(requireRequestMember(EVENT)).rejects.toMatchObject({ statusCode: 401 });
	});
	it("does not report an auth service outage as an expired session", async (): Promise<void> => {
		mocks.header.mockReturnValue("Bearer valid");
		mocks.getUser.mockResolvedValue({ data: { user: null }, error: { status: 503 } });
		await expect(requireRequestMember(EVENT)).rejects.toMatchObject({ statusCode: 503 });
		expect(mocks.maybeSingle).not.toHaveBeenCalled();
	});
	it.each([{ is_mentor: true, deleted: true }])("rejects deleted database records", async (member: { is_mentor: boolean; deleted: boolean }): Promise<void> => {
		mocks.header.mockReturnValue("Bearer valid");
		mocks.getUser.mockResolvedValue({ data: { user: { email: `${ID}@coderdojoennis.com`, email_confirmed_at: "2026-10-10", user_metadata: { isMentor: true } } }, error: null });
		mocks.maybeSingle.mockResolvedValue({ data: { id: ID, ...member }, error: null });
		await expect(requireRequestMember(EVENT)).rejects.toMatchObject({ statusCode: 403 });
	});
	it.each([true, false])("returns the active member identity regardless of mentor role", async (isMentor: boolean): Promise<void> => {
		mocks.header.mockReturnValue("Bearer valid");
		mocks.getUser.mockResolvedValue({ data: { user: { email: `${ID}@coderdojoennis.com`, email_confirmed_at: "2026-10-10" } }, error: null });
		mocks.maybeSingle.mockResolvedValue({ data: { id: ID, is_mentor: isMentor, deleted: false }, error: null });
		await expect(requireRequestMember(EVENT)).resolves.toMatchObject({ id: ID });
	});
});
