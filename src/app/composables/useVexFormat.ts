import type { MemberModel } from "#shared/types/models/MemberModel";
import type { VexSprintStatus } from "#shared/types/models/VexSprintModel";
import type { VexTaskStatus } from "#shared/types/models/VexTaskModel";

type BadgeColor = "neutral" | "warning" | "success" | "primary" | "info";

const TASK_STATUS_COLORS: Record<VexTaskStatus, BadgeColor> = {
	done: "success",
	in_progress: "warning",
	todo: "neutral",
};

const TASK_STATUS_ICONS: Record<VexTaskStatus, string> = {
	done: "i-lucide-circle-check-big",
	in_progress: "i-lucide-loader-circle",
	todo: "i-lucide-circle",
};

const SPRINT_STATUS_COLORS: Record<VexSprintStatus, BadgeColor> = {
	complete: "neutral",
	current: "primary",
	planned: "info",
};

/**
 * Display helpers shared by the VEX workspace pages and components
 */
export function useVexFormat() {
	const { locale } = useI18n();

	/**
	 * Format a YYYY-MM-DD date as e.g. "Sat 10 Oct"
	 */
	function formatDate(value: string | null | undefined): string {
		if (!value) {
			return "";
		}
		const date: Date = new Date(`${value}T00:00:00`);
		if (Number.isNaN(date.getTime())) {
			return value;
		}
		return date.toLocaleDateString(locale.value, {
			weekday: "short",
			day: "numeric",
			month: "short",
		});
	}

	/**
	 * Display name for a member
	 */
	function memberName(member: MemberModel | null | undefined): string {
		if (!member) {
			return "?";
		}
		const full: string =
			`${member.nameFirst ?? ""} ${member.nameLast ?? ""}`.trim();
		return full || member.login || "?";
	}

	return {
		SPRINT_STATUS_COLORS,
		TASK_STATUS_COLORS,
		TASK_STATUS_ICONS,
		formatDate,
		memberName,
	};
}
