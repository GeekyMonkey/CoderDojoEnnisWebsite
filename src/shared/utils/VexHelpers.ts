/**
 * VexHelpers
 * Pure helpers for the VEX team workspace (seasons, sprints, tasks).
 */

type SeasonLike = { id: string; isCurrent: boolean; slug: string };
type SprintLike = {
	id: string;
	seasonId: string;
	sprintNumber: number;
	status: "planned" | "current" | "complete";
	startDate: string | null;
};
type TaskLike = {
	sprintId: string;
	status: "todo" | "in_progress" | "done";
};

export type VexTaskProgress = {
	todo: number;
	inProgress: number;
	done: number;
	total: number;
};

const SATURDAY: number = 6;

/**
 * Pick the current season (flagged current, else the newest by slug)
 */
export function VexFindCurrentSeason<T extends SeasonLike>(
	seasons: T[],
): T | null {
	const flagged: T | undefined = seasons.find((s) => s.isCurrent);
	if (flagged) {
		return flagged;
	}
	const sorted: T[] = [...seasons].sort((a, b) => b.slug.localeCompare(a.slug));
	return sorted[0] ?? null;
}

/**
 * Sprints for one season, ordered by sprint number
 */
export function VexSeasonSprints<T extends SprintLike>(
	sprints: T[],
	seasonId: string | null | undefined,
): T[] {
	if (!seasonId) {
		return [];
	}
	return sprints
		.filter((s) => s.seasonId === seasonId)
		.sort((a, b) => a.sprintNumber - b.sprintNumber);
}

/**
 * Pick "this week's" sprint for a season: the one marked current,
 * else the latest started (non-planned) sprint, else the first planned one.
 */
export function VexFindCurrentSprint<T extends SprintLike>(
	sprints: T[],
	seasonId: string | null | undefined,
): T | null {
	const seasonSprints: T[] = VexSeasonSprints(sprints, seasonId);
	const current: T | undefined = seasonSprints.find(
		(s) => s.status === "current",
	);
	if (current) {
		return current;
	}
	const started: T[] = seasonSprints.filter((s) => s.status !== "planned");
	if (started.length > 0) {
		return started[started.length - 1] ?? null;
	}
	return seasonSprints[0] ?? null;
}

/**
 * Add days to a YYYY-MM-DD date string (UTC-safe)
 */
export function VexAddDays(dateString: string, days: number): string {
	const date: Date = new Date(`${dateString}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

/**
 * The next Saturday on or after a YYYY-MM-DD date (Dojo day)
 */
export function VexNextSaturday(fromDate: string): string {
	const date: Date = new Date(`${fromDate}T00:00:00Z`);
	const diff: number = (SATURDAY - date.getUTCDay() + 7) % 7;
	return VexAddDays(fromDate, diff);
}

/**
 * Suggested defaults for a mentor starting the next sprint in a season
 */
export function VexSuggestNextSprint<T extends SprintLike>(
	sprints: T[],
	seasonId: string,
	today: string,
): { sprintNumber: number; startDate: string; reviewDate: string } {
	const seasonSprints: T[] = VexSeasonSprints(sprints, seasonId);
	const last: T | undefined = seasonSprints[seasonSprints.length - 1];
	const sprintNumber: number = (last?.sprintNumber ?? 0) + 1;
	const lastStartPlusWeek: string | null = last?.startDate
		? VexAddDays(last.startDate, 7)
		: null;
	const todaySaturday: string = VexNextSaturday(today);
	const startDate: string =
		lastStartPlusWeek && lastStartPlusWeek > todaySaturday
			? lastStartPlusWeek
			: todaySaturday;
	return {
		sprintNumber,
		startDate,
		reviewDate: VexAddDays(startDate, 7),
	};
}

/**
 * Count tasks by status
 */
export function VexTaskProgressCounts(tasks: TaskLike[]): VexTaskProgress {
	const progress: VexTaskProgress = {
		todo: 0,
		inProgress: 0,
		done: 0,
		total: tasks.length,
	};
	for (const task of tasks) {
		if (task.status === "done") {
			progress.done++;
		} else if (task.status === "in_progress") {
			progress.inProgress++;
		} else {
			progress.todo++;
		}
	}
	return progress;
}

/**
 * Group tasks by sprint id
 */
export function VexTasksBySprintId<T extends TaskLike>(
	tasks: T[],
): Record<string, T[]> {
	const bySprint: Record<string, T[]> = {};
	for (const task of tasks) {
		const list: T[] = bySprint[task.sprintId] ?? [];
		list.push(task);
		bySprint[task.sprintId] = list;
	}
	return bySprint;
}

/**
 * Today's date as YYYY-MM-DD in local time
 */
export function VexToday(): string {
	const d: Date = new Date();
	const yyyy: number = d.getFullYear();
	const mm: string = String(d.getMonth() + 1).padStart(2, "0");
	const dd: string = String(d.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}
