import { it, expect, vi } from "vitest";
import type { SupabaseClientType } from "./DatabaseClient";
import { getAchievementReviews } from "./AchievementReviewsData";
vi.mock("#server/db/DatabaseClient", () => ({
	GetSupabaseAdminClient: vi.fn(),
}));
it("repairs first, batch resolves hidden projects and excludes raced deletions from authorized evidence", async (): Promise<void> => {
	const owner: string = "00000000-0000-4000-8000-000000000001";
	const definition: string = "00000000-0000-4000-8000-000000000002";
	const project: string = "00000000-0000-4000-8000-000000000003";
	const missing: string = "00000000-0000-4000-8000-000000000004";
	const record: Record<string, unknown> = {
		id: definition,
		member_id: owner,
		badge_id: definition,
		goal_date: null,
		application_date: "2026-10-15T10:00:00",
		application_notes: "My evidence",
		awarded: null,
		awarded_notes: null,
		awarded_by_adult_id: null,
		rejected_date: null,
		rejected_notes: null,
		rejected_by_adult_id: null,
		showcase_item_ids: [project, missing],
	};
	const tables: Record<string, unknown[]> = {
		member_badges: [record, { ...record, id: project }],
		members: [
			{
				id: owner,
				name_first: "Fixture",
				name_last: "Coder",
				login: "fixture",
				has_avatar: false,
				has_photo: false,
				is_ninja: true,
				is_parent: false,
				is_mentor: false,
				github_login: null,
				scratch_name: "fixture",
				deleted: false,
			},
		],
		badges: [
			{
				id: definition,
				deleted: false,
				badge_category_id: definition,
				achievement: "Maker",
				description: "Create",
			},
		],
		belts: [],
		badge_categories: [{ id: definition, category_name: "Games" }],
		member_showcase: [
			{
				id: project,
				member_id: owner,
				title: "Hidden game",
				description: "Playable evidence",
				project_type: "website",
				url: "https://example.com",
				thumbnail_path: null,
				thumbnail_version: 0,
				source_project_id: null,
				showcase_date: "2026-10-15",
				is_visible: false,
				created_at: "2026-10-15T10:00:00Z",
				updated_at: "2026-10-15T10:00:00Z",
			},
		],
	};
	const events: string[] = [];
	const filters: ReturnType<typeof vi.fn> = vi.fn();
	const rpc: ReturnType<typeof vi.fn> = vi.fn(async (): Promise<object> => {
		events.push("repair");
		return { error: null };
	});
	/** Model fluent transport responses without replacing projection or schema validation. */
	function from(table: string): object {
		events.push(table);
		const query: Record<string, unknown> = {};
		for (const method of ["select", "eq", "not", "is", "order", "in"])
			query[method] = (...args: unknown[]): object => {
				filters(table, method, ...args);
				return query;
			};
		query.then = (resolve: (value: unknown) => unknown): unknown =>
			resolve({ data: tables[table] ?? [], error: null });
		return query;
	}
	const client: SupabaseClientType = {
		schema: () => ({ from, rpc }),
		storage: {
			from: () => ({
				getPublicUrl: () => ({
					data: { publicUrl: "https://example.com/image.png" },
				}),
			}),
		},
	} as unknown as SupabaseClientType;
	const reviews: Awaited<ReturnType<typeof getAchievementReviews>> =
		await getAchievementReviews(client, "badge", owner);
	expect(events[0]).toBe("repair");
	expect(rpc).toHaveBeenCalledWith("repair_application_showcase", {
		p_kind: "badge",
		p_member: owner,
	});
	expect(
		events.filter((value: string): boolean => value === "member_showcase"),
	).toHaveLength(1);
	expect(filters).toHaveBeenCalledWith("member_showcase", "in", "id", [
		project,
		missing,
	]);
	expect(reviews).toHaveLength(2);
	for (const review of reviews) {
		expect(review.showcaseItemIds).toEqual([project]);
		expect(review.showcaseItems?.[0]).toMatchObject({
			title: "Hidden game",
			isVisible: false,
			memberName: "Fixture Coder",
		});
	}
	expect(
		filters.mock.calls.some(
			(call: unknown[]): boolean =>
				call[0] === "member_showcase" && call[2] === "is_visible",
		),
	).toBe(false);
});
