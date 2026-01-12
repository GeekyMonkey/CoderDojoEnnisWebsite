import { describe, expect, it } from "vitest";
import {
	buildNavigationModel,
	filterNavByRoles,
	getMemberRoles,
	getRoleFlagsFromUserMeta,
	type MemberNavGroup,
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
