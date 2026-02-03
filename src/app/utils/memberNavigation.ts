import type { NavigationMenuItem } from "@nuxt/ui";
import type { SupabaseUserMetaType } from "#shared/types/Supabase";

export type MemberRole = "mentor" | "parent" | "coder";

export type MemberRoleFlags = {
	isMentor: boolean;
	isParent: boolean;
	isCoder: boolean;
};

export type MemberNavItem = {
	label: string;
	to?: string;
	icon?: string;
	roles?: MemberRole[];
	badge?: string;
	children?: MemberNavItem[];
};

export type MemberNavGroup = {
	items: MemberNavItem[];
};

export function getRoleFlagsFromUserMeta(
	meta: SupabaseUserMetaType | null | undefined,
): MemberRoleFlags {
	const anyMeta = (meta ?? {}) as Record<string, any>;
	return {
		isMentor: anyMeta.isMentor === true,
		isParent: anyMeta.isParent === true,
		isCoder: anyMeta.isNinja === true,
	};
}

export function getMemberRoles(flags: MemberRoleFlags): MemberRole[] {
	const roles: MemberRole[] = [];
	if (flags.isMentor) roles.push("mentor");
	if (flags.isParent) roles.push("parent");
	if (flags.isCoder) roles.push("coder");
	return roles;
}

export function filterNavByRoles(
	groups: MemberNavGroup[],
	roles: MemberRole[],
): MemberNavGroup[] {
	const roleSet = new Set(roles);

	const keepItem = (item: MemberNavItem): boolean => {
		if (!item.roles || item.roles.length === 0) {
			return true;
		}
		return item.roles.some((r) => roleSet.has(r));
	};

	const mapItem = (item: MemberNavItem): MemberNavItem | null => {
		if (!keepItem(item)) return null;
		if (!item.children?.length) return item;

		const children = item.children
			.map(mapItem)
			.filter((i): i is MemberNavItem => i !== null);
		return { ...item, children };
	};

	return groups
		.map((group) => {
			const items = group.items
				.map(mapItem)
				.filter((i): i is MemberNavItem => i !== null);
			return { items };
		})
		.filter((g) => g.items.length > 0);
}

export function buildNavigationModel(basePath: string): MemberNavGroup[] {
	const mentorBase = `${basePath}/mentor`;
	const parentBase = `${basePath}/parent`;
	const coderBase = `${basePath}/coder`;
	const maintenanceBase = `${mentorBase}/maintenance`;
	const reportsBase = `${mentorBase}/reports`;

	return [
		{
			items: [
				{
					label: "Parent Home",
					to: `${parentBase}`,
					icon: "i-lucide-house",
					roles: ["parent"],
				},
				{
					label: "My Kids",
					icon: "i-lucide-users-round",
					roles: ["parent"],
					children: [
						{
							label: "Child 1",
							to: `${parentBase}/kids/child-1`,
							roles: ["parent"],
						},
						{
							label: "Child 2",
							to: `${parentBase}/kids/child-2`,
							roles: ["parent"],
						},
					],
				},
				{
					label: "Mentor Home",
					to: `${mentorBase}`,
					icon: "i-lucide-house",
					roles: ["mentor"],
				},
				{
					label: "Attendance",
					to: `${mentorBase}/attendance`,
					icon: "i-lucide-calendar-check",
					roles: ["mentor"],
				},
				{
					label: "Members",
					to: `${mentorBase}/members`,
					icon: "i-lucide-users",
					roles: ["mentor"],
				},
				{
					label: "Parents",
					to: `${mentorBase}/parents`,
					icon: "i-lucide-user-round",
					roles: ["mentor"],
				},
				{
					label: "Mentors",
					to: `${mentorBase}/mentors`,
					icon: "i-lucide-graduation-cap",
					roles: ["mentor"],
				},
				{
					label: "Sign In Mode",
					to: `${mentorBase}/SignIn`,
					icon: "i-lucide-log-in",
					roles: ["mentor"],
				},
				{
					label: "Coder Home",
					to: `${coderBase}`,
					icon: "i-lucide-house",
					roles: ["coder"],
				},
				{
					label: "Badges",
					to: `${coderBase}/badges`,
					icon: "i-lucide-award",
					roles: ["coder"],
				},
				{
					label: "Badges Available",
					to: `${coderBase}/badges-available`,
					icon: "i-lucide-badge-check",
					roles: ["coder"],
				},
				{
					label: "Belts",
					to: `${coderBase}/belts`,
					icon: "i-lucide-git-commit-horizontal",
					roles: ["coder"],
				},
				{
					label: "Goals",
					to: `${coderBase}/goals`,
					icon: "i-lucide-target",
					roles: ["coder"],
				},
				{
					label: "Attendance",
					to: `${coderBase}/attendance`,
					icon: "i-lucide-calendar-check",
					roles: ["coder"],
				},
			],
		},
		{
			items: [
				{
					label: "Maintenance",
					icon: "i-lucide-wrench",
					roles: ["mentor"],
					children: [
						{
							label: "Belts",
							to: `${maintenanceBase}/belts`,
							roles: ["mentor"],
						},
						{
							label: "Badges",
							to: `${maintenanceBase}/badges`,
							roles: ["mentor"],
						},
						{
							label: "Badge Categories",
							to: `${maintenanceBase}/badge-categories`,
							roles: ["mentor"],
						},
						{
							label: "Teams",
							to: `${maintenanceBase}/teams`,
							roles: ["mentor"],
						},
						{
							label: "Purge Members",
							to: `${maintenanceBase}/purge-members`,
							roles: ["mentor"],
						},
						{
							label: "Purge Registrations",
							to: `${maintenanceBase}/purge-registrations`,
							roles: ["mentor"],
						},
					],
				},
				{
					label: "Reports",
					icon: "i-lucide-bar-chart-3",
					roles: ["mentor"],
					children: [
						{
							label: "Parent Emails CSV",
							to: `${reportsBase}/parent-emails-csv`,
							roles: ["mentor"],
						},
						{
							label: "Mentor Email CSV",
							to: `${reportsBase}/mentor-email-csv`,
							roles: ["mentor"],
						},
						{
							label: "Recent Belts",
							to: `${reportsBase}/recent-belts`,
							roles: ["mentor"],
						},
						{
							label: "Recent Belts CSV",
							to: `${reportsBase}/recent-belts-csv`,
							roles: ["mentor"],
						},
					],
				},
			],
		},
	];
}

export function toNavigationMenuItems(
	groups: MemberNavGroup[],
	translateLabel: (label: string) => string = (label) => label,
): NavigationMenuItem[][] {
	return groups.map((g) =>
		g.items.map((i) => {
			const item: NavigationMenuItem = {
				label: translateLabel(i.label),
				icon: i.icon,
				badge: i.badge,
			};

			if (i.to) {
				item.to = i.to;
			}

			if (i.children?.length) {
				item.children = i.children.map((c) => ({
					label: translateLabel(c.label),
					to: c.to,
					icon: c.icon,
					badge: c.badge,
				}));
			}

			return item;
		}),
	);
}
