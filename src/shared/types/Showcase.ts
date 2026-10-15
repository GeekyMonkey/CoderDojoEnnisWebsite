import { z } from "zod";

export const PROJECT_TYPES = [
	"scratch",
	"itch",
	"website",
	"github_profile",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];
export type ShowcaseRole = "coder" | "parent" | "mentor";
export const PROJECT_LABELS: Record<ProjectType, string> = {
	scratch: "Scratch",
	itch: "itch.io",
	website: "Website",
	github_profile: "GitHub profile",
};
export const PROJECT_ICONS: Record<ProjectType, string> = {
	scratch: "i-simple-icons-scratch",
	itch: "i-simple-icons-itchdotio",
	website: "i-lucide-globe",
	github_profile: "i-simple-icons-github",
};
export const showcaseFieldsSchema = z
	.strictObject({
		title: z.string().trim().min(1).max(200),
		description: z.string().trim().min(1).max(10000),
		projectType: z.enum(PROJECT_TYPES),
		url: z.string().max(2000),
		showcaseDate: z.iso.date(),
		isVisible: z.boolean(),
		sourceProjectId: z.string().max(200).nullable(),
	})
	.refine(
		(value): boolean =>
			(!value.url &&
				value.projectType === "github_profile" &&
				!value.isVisible) ||
			(/^https?:\/\//i.test(value.url) && URL.canParse(value.url)),
		{ message: "Enter a public HTTP(S) project URL", path: ["url"] },
	);
export type ShowcaseFields = z.infer<typeof showcaseFieldsSchema>;
export type ShowcaseItem = ShowcaseFields & {
	id: string;
	memberId: string;
	thumbnailUrl: string | null;
	updatedAt: string;
	createdAt: string;
	memberName: string;
	username: string;
	roles: ShowcaseRole[];
	avatarUrl: string | null;
	photoUrl: string | null;
};
export type ShowcaseContext = {
	memberId: string;
	githubLogin: string | null;
	scratchName: string | null;
	profileUrl: string;
	items: ShowcaseItem[];
};
export type ProjectPreview = {
	sourceProjectId: string;
	title: string;
	description: string;
	url: string;
	imageUrl: string | null;
};
export type ShowcaseFilters = {
	memberType: ShowcaseRole;
	projectType: ProjectType | "";
	username: string;
	sort: "newest" | "oldest";
};

/** Apply combined public filters without duplicating multi-role owners. */
export function filterShowcase(
	items: ShowcaseItem[],
	filters: ShowcaseFilters,
): ShowcaseItem[] {
	const search: string = filters.username.trim().toLocaleLowerCase();
	return items
		.filter(
			(item: ShowcaseItem): boolean =>
				item.roles.includes(filters.memberType) &&
				(!filters.projectType || item.projectType === filters.projectType) &&
				item.username.toLocaleLowerCase().includes(search),
		)
		.sort(
			(a: ShowcaseItem, b: ShowcaseItem): number =>
				(filters.sort === "newest" ? -1 : 1) *
				(a.showcaseDate.localeCompare(b.showcaseDate) ||
					a.createdAt.localeCompare(b.createdAt) ||
					a.id.localeCompare(b.id)),
		);
}
