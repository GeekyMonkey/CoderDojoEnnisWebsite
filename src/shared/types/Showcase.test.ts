import { describe, expect, it } from "vitest";
import {
	filterShowcase,
	showcaseFieldsSchema,
	type ShowcaseItem,
} from "./Showcase";
const base: ShowcaseItem = {
	id: "a",
	memberId: "m",
	title: "Game",
	description: "Play",
	projectType: "scratch",
	url: "https://scratch.mit.edu/projects/1/",
	showcaseDate: "2026-10-15",
	isVisible: true,
	sourceProjectId: "1",
	thumbnailUrl: null,
	createdAt: "2026-10-15T10:00:00Z",
	updatedAt: "2026-10-15T10:00:00Z",
	memberName: "Coder",
	username: "Ada",
	roles: ["coder", "parent"],
	avatarUrl: null,
	photoUrl: null,
};
describe("showcase public contracts", (): void => {
	it("combines role, project and username filters with newest first", (): void => {
		const result: ShowcaseItem[] = filterShowcase(
			[
				base,
				{ ...base, id: "b", showcaseDate: "2026-10-16" },
				{ ...base, id: "c", roles: ["mentor"] },
			],
			{
				memberType: "coder",
				projectType: "scratch",
				username: "AD",
				sort: "newest",
			},
		);
		expect(result.map((item: ShowcaseItem): string => item.id)).toEqual([
			"b",
			"a",
		]);
	});
	it("rejects unsafe links and impossible dates but accepts a hidden GitHub draft", (): void => {
		const {
			id,
			memberId,
			thumbnailUrl,
			createdAt,
			updatedAt,
			memberName,
			username,
			roles,
			avatarUrl,
			photoUrl,
			...fields
		} = base;
		expect(
			showcaseFieldsSchema.safeParse({ ...fields, url: "javascript:alert(1)" })
				.success,
		).toBe(false);
		expect(
			showcaseFieldsSchema.safeParse({ ...fields, showcaseDate: "2026-02-30" })
				.success,
		).toBe(false);
		expect(
			showcaseFieldsSchema.safeParse({
				...fields,
				projectType: "github_profile",
				url: "",
				isVisible: false,
			}).success,
		).toBe(true);
	});
});
