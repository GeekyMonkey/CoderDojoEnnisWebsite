import { describe, expect, it } from "vitest";
import {
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
});
