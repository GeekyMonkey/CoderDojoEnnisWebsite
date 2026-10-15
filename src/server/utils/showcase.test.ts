import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import {
	showcaseActor,
	showcaseItem,
	type ShowcaseOwner,
	type ShowcaseRow,
} from "./showcase";
import type { VerifiedMember } from "./requestMember";
const mocks = vi.hoisted(() => ({ member: vi.fn(), query: vi.fn() }));
vi.mock("./requestMember", (): object => ({
	requireRequestMember: mocks.member,
}));
vi.mock("#server/db/DatabaseClient", (): object => ({
	GetSupabaseAdminClient: vi.fn(),
}));
vi.mock(
	"h3",
	async (importOriginal): Promise<object> => ({
		...(await importOriginal<typeof import("h3")>()),
		getQuery: mocks.query,
	}),
);
const ownerId: string = "00000000-0000-4000-8000-000000000001";
const editorId: string = "00000000-0000-4000-8000-000000000002";
const owner: ShowcaseOwner = {
	id: ownerId,
	name_first: "Ada",
	name_last: "Coder",
	login: "ada",
	has_avatar: true,
	has_photo: true,
	is_ninja: true,
	is_parent: false,
	is_mentor: false,
	github_login: "ada",
	scratch_name: "ada",
	deleted: false,
};
/** Create a Supabase-shaped query boundary with fixed selected data. */
function client(data: unknown): object {
	const chain: {
		select: () => unknown;
		eq: () => unknown;
		maybeSingle: () => Promise<{ data: unknown; error: null }>;
	} = {
		select: () => chain,
		eq: () => chain,
		maybeSingle: async () => ({ data, error: null }),
	};
	return {
		schema: () => ({ from: () => chain }),
		storage: {
			from: () => ({
				getPublicUrl: (path: string) => ({
					data: { publicUrl: `https://storage.example/${path}` },
				}),
			}),
		},
	};
}
beforeEach((): void => {
	vi.resetAllMocks();
	mocks.query.mockReturnValue({ memberId: ownerId });
});
describe("showcase authorized presentation", (): void => {
	it("denies an unrelated non-mentor writer", async (): Promise<void> => {
		mocks.member.mockResolvedValue({
			id: editorId,
			member: { isMentor: false, isParent: false },
			client: client(owner),
			readClient: client(null),
		});
		await expect(showcaseActor({} as H3Event)).rejects.toMatchObject({
			statusCode: 403,
		});
	});
	it("allows a linked parent using the target account", async (): Promise<void> => {
		mocks.member.mockResolvedValue({
			id: editorId,
			member: { isMentor: false, isParent: true },
			client: client(owner),
			readClient: client({ id: "link" }),
		});
		expect((await showcaseActor({} as H3Event)).owner.scratch_name).toBe("ada");
	});
	it("allows mentors without a parent relationship", async (): Promise<void> => {
		mocks.member.mockResolvedValue({
			id: editorId,
			member: { isMentor: true, isParent: false },
			client: client(owner),
			readClient: client(null),
		});
		expect((await showcaseActor({} as H3Event)).owner.id).toBe(ownerId);
	});
	it("includes the requested name/avatar/photo and omits private fields", (): void => {
		const row: ShowcaseRow = {
			id: "entry",
			member_id: ownerId,
			title: "Game",
			description: "Play",
			project_type: "scratch",
			url: "https://scratch.mit.edu/projects/1/",
			thumbnail_path: "image.png",
			thumbnail_version: 1,
			source_project_id: "1",
			showcase_date: "2026-10-15",
			is_visible: true,
			created_at: "2026-10-15T00:00:00Z",
			updated_at: "2026-10-15T00:00:00Z",
		};
		const result = showcaseItem(client(null) as VerifiedMember["client"], row, {
			...owner,
			email: "private@example.invalid",
		} as ShowcaseOwner);
		expect(result).toMatchObject({
			memberName: "Ada Coder",
			username: "ada",
			roles: ["coder"],
		});
		expect(result.avatarUrl).toContain("/Avatars/");
		expect(result.photoUrl).toContain("/Photos/");
		expect(result).not.toHaveProperty("email");
		expect(result).not.toHaveProperty("githubLogin");
	});
});
