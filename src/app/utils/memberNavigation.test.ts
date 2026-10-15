import { describe, expect, it } from "vitest";
import type { NavigationMenuItem } from "@nuxt/ui";
import {
	buildNavigationModel,
	buildRoleNavigationSections,
	filterNavByRoles,
	getMemberRoles,
	getRoleFlagsFromUserMeta,
	type MemberNavGroup,
	type MemberRole,
	type MemberNavSection,
} from "./memberNavigation";

describe("memberNavigation", () => {
	it("derives roles from Supabase meta flags", () => {
		const flags = getRoleFlagsFromUserMeta({
			isMentor: true,
			isParent: false,
			isNinja: true,
		});
		expect(flags).toEqual({ isMentor: true, isParent: false, isCoder: true });

		const roles = getMemberRoles(flags);
		expect(roles).toEqual(["mentor", "coder"]);
	});

	it("filters nav groups by role", () => {
		const groups: MemberNavGroup[] = [
			{
				items: [
					{ label: "Mentor", to: "/mentor", roles: ["mentor"] },
					{ label: "Parent", to: "/parent", roles: ["parent"] },
					{ label: "Common", to: "/common" },
				],
			},
			{
				items: [{ label: "Coder", to: "/coder", roles: ["coder"] }],
			},
		];

		const filtered = filterNavByRoles(groups, ["mentor"]);
		expect(filtered).toEqual([
			{
				items: [
					{ label: "Mentor", to: "/mentor", roles: ["mentor"] },
					{ label: "Common", to: "/common" },
				],
			},
		]);
	});

	it("includes 'My Kids' for parents only", () => {
		const model = buildNavigationModel("");

		const parentNav = filterNavByRoles(model, ["parent"]);
		const parentLabels = parentNav.flatMap((g) => g.items.map((i) => i.label));
		expect(parentLabels).toContain("Parent Home");
		expect(parentLabels).toContain("My Kids");

		const mentorNav = filterNavByRoles(model, ["mentor"]);
		const mentorLabels = mentorNav.flatMap((g) => g.items.map((i) => i.label));
		expect(mentorLabels).not.toContain("My Kids");
	});

	it("includes coder menu items for coders", () => {
		const model = buildNavigationModel("");
		const coderNav = filterNavByRoles(model, ["coder"]);
		const coderLabels = coderNav.flatMap((g) => g.items.map((i) => i.label));

		expect(coderLabels).toContain("Coder Home");
		expect(coderLabels).toContain("Badges");
		expect(coderLabels).toContain("Badges Available");
		expect(coderLabels).toContain("Belts");
		expect(coderLabels).toContain("Goals");
		expect(coderLabels).toContain("Attendance");
	});
});

describe("role navigation sections", () => {
	const model: MemberNavGroup[] = buildNavigationModel("");
	const allRoles: MemberRole[] = ["coder", "parent", "mentor"];

	/** Keep English labels unchanged for navigation checks. */
	function translate(label: string): string {
		return label;
	}

	it("keeps Mentor, Parent, Coder order for all role combinations", () => {
		for (let mask: number = 0; mask < 8; mask++) {
			const roles: MemberRole[] = allRoles.filter(
				(_role: MemberRole, index: number): boolean =>
					Boolean(mask & (1 << index)),
			);
			const sections: MemberNavSection[] = buildRoleNavigationSections(
				model,
				roles,
				translate,
				"en",
			);
			expect(
				sections.map((section: MemberNavSection): MemberRole => section.role),
			).toEqual(
				(["mentor", "parent", "coder"] as MemberRole[]).filter(
					(role: MemberRole): boolean => roles.includes(role),
				),
			);
		}
	});

	it("sorts mentor items and keeps both submenus within Mentor", () => {
		const sections: MemberNavSection[] = buildRoleNavigationSections(
			model,
			allRoles,
			translate,
			"en",
		);
		expect(
			sections[0]?.items.map(
				(item: NavigationMenuItem): string | undefined => item.label,
			),
		).toEqual([
			"Mentor Home",
			"Attendance",
			"Coders",
			"Maintenance",
			"Mentors",
			"Parents",
			"Reports",
			"Showcase",
			"Sign In Mode",
		]);
		expect(
			sections[0]?.items
				.find(
					(item: NavigationMenuItem): boolean => item.label === "Maintenance",
				)
				?.children?.map(
					(item: NavigationMenuItem): string | undefined => item.label,
				),
		).toEqual([
			"Badge Categories",
			"Badges",
			"Belts",
			"Purge Members",
			"Purge Registrations",
			"Teams",
		]);
		for (const section of sections.slice(1))
			expect(
				section.items.some((item: NavigationMenuItem): boolean =>
					["Maintenance", "Reports"].includes(item.label ?? ""),
				),
			).toBe(false);
	});

	it("reveals matching nested options and expands their parent", () => {
		const sections: MemberNavSection[] = buildRoleNavigationSections(
			model,
			allRoles,
			translate,
			"en",
			"  RECENT BELTS  ",
		);
		expect(sections).toHaveLength(1);
		expect(sections[0]?.role).toBe("mentor");
		expect(sections[0]?.items).toHaveLength(1);
		expect(sections[0]?.items[0]).toMatchObject({
			label: "Reports",
			defaultOpen: true,
		});
		expect(
			sections[0]?.items[0]?.children?.map(
				(item: NavigationMenuItem): string | undefined => item.label,
			),
		).toEqual(["Recent Belts", "Recent Belts CSV"]);
	});

	it("keeps all permitted children when the submenu label matches", () => {
		const sections: MemberNavSection[] = buildRoleNavigationSections(
			model,
			allRoles,
			translate,
			"en",
			"maintenance",
		);
		expect(sections[0]?.items[0]?.children).toHaveLength(6);
		expect(sections[0]?.items[0]?.defaultOpen).toBe(true);
	});

	it("sorts and searches translated labels while preserving role order", () => {
		const translated: (label: string) => string = (label: string): string =>
			label === "Coders"
				? "Équipe"
				: label === "Sign In Mode"
					? "Alpha"
					: label;
		const sections: MemberNavSection[] = buildRoleNavigationSections(
			model,
			allRoles,
			translated,
			"fr",
		);
		expect(
			sections.map((section: MemberNavSection): MemberRole => section.role),
		).toEqual(["mentor", "parent", "coder"]);
		expect(sections[0]?.items[0]?.label).toBe("Mentor Home");
		expect(
			buildRoleNavigationSections(model, allRoles, translated, "fr", "EQUI")[0]
				?.items[0]?.to,
		).toBe("/mentor/coders");
	});

	it("does not expose mentor options to parents through search", () => {
		expect(
			buildRoleNavigationSections(
				model,
				["parent"],
				translate,
				"en",
				"maintenance",
			),
		).toEqual([]);
		expect(
			buildRoleNavigationSections(
				model,
				["parent"],
				translate,
				"en",
				"recent belts",
			),
		).toEqual([]);
	});

	it("hides unmatched sections and restores the original model after clearing", () => {
		const original: string = JSON.stringify(model);
		expect(
			buildRoleNavigationSections(
				model,
				allRoles,
				translate,
				"en",
				"no-such-page",
			),
		).toEqual([]);
		buildRoleNavigationSections(model, allRoles, translate, "en", "reports");
		const cleared: MemberNavSection[] = buildRoleNavigationSections(
			model,
			allRoles,
			translate,
			"en",
			"",
		);
		expect(cleared).toHaveLength(3);
		expect(cleared[0]?.items).toHaveLength(9);
		expect(
			cleared[0]?.items.find(
				(item: NavigationMenuItem): boolean => item.label === "Reports",
			)?.defaultOpen,
		).toBeUndefined();
		expect(JSON.stringify(model)).toBe(original);
	});
});

it("pins Home ahead of translated alphabetical options and removes role session links", (): void => {
	for (const role of ["mentor", "parent", "coder"] as const) {
		const sections: MemberNavSection[] = buildRoleNavigationSections(
			buildNavigationModel(""),
			[role],
			(label: string): string => (label.endsWith("Home") ? "ZZZ" : label),
			"fr",
		);
		expect(sections[0]?.items[0]?.to).toBe(`/${role}`);
		expect(
			sections[0]?.items.some((item: NavigationMenuItem): boolean =>
				String(item.to).endsWith("/sessions"),
			),
		).toBe(false);
	}
});
