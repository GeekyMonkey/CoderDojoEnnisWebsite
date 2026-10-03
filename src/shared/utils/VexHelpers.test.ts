import { describe, expect, it } from "vitest";
import {
	VexAddDays,
	VexFindCurrentSeason,
	VexFindCurrentSprint,
	VexNextSaturday,
	VexSuggestNextSprint,
	VexTaskProgressCounts,
	VexTasksBySprintId,
} from "./VexHelpers";

type TestSprint = {
	id: string;
	seasonId: string;
	sprintNumber: number;
	status: "planned" | "current" | "complete";
	startDate: string | null;
};

/**
 * Build a sprint for tests
 */
const sprint = (
	id: string,
	sprintNumber: number,
	status: TestSprint["status"],
	startDate: string | null = null,
	seasonId: string = "s1",
): TestSprint => ({ id, seasonId, sprintNumber, status, startDate });

describe("VexHelpers", () => {
	it("finds the flagged current season, else the newest", () => {
		const levelUp = { id: "a", slug: "2026-27-level-up", isCurrent: false };
		const nextGame = { id: "b", slug: "2027-28-next", isCurrent: false };
		expect(VexFindCurrentSeason([levelUp, nextGame])?.id).toBe("b");
		expect(
			VexFindCurrentSeason([{ ...levelUp, isCurrent: true }, nextGame])?.id,
		).toBe("a");
		expect(VexFindCurrentSeason([])).toBeNull();
	});

	it("prefers the current sprint, then the latest started, then the first planned", () => {
		expect(
			VexFindCurrentSprint(
				[sprint("1", 1, "complete"), sprint("2", 2, "current")],
				"s1",
			)?.id,
		).toBe("2");
		expect(
			VexFindCurrentSprint(
				[
					sprint("1", 1, "complete"),
					sprint("2", 2, "complete"),
					sprint("3", 3, "planned"),
				],
				"s1",
			)?.id,
		).toBe("2");
		expect(VexFindCurrentSprint([sprint("1", 1, "planned")], "s1")?.id).toBe(
			"1",
		);
		expect(
			VexFindCurrentSprint([sprint("1", 1, "current", null, "other")], "s1"),
		).toBeNull();
	});

	it("handles date arithmetic and Saturdays", () => {
		expect(VexAddDays("2026-10-03", 7)).toBe("2026-10-10");
		expect(VexAddDays("2026-12-28", 7)).toBe("2027-01-04");
		// 2026-10-03 is a Saturday
		expect(VexNextSaturday("2026-10-03")).toBe("2026-10-03");
		expect(VexNextSaturday("2026-10-04")).toBe("2026-10-10");
		expect(VexNextSaturday("2026-10-09")).toBe("2026-10-10");
	});

	it("suggests the next sprint number and dates", () => {
		expect(VexSuggestNextSprint([], "s1", "2026-10-01")).toEqual({
			sprintNumber: 1,
			startDate: "2026-10-03",
			reviewDate: "2026-10-10",
		});
		expect(
			VexSuggestNextSprint(
				[sprint("1", 1, "current", "2026-10-10")],
				"s1",
				"2026-10-01",
			),
		).toEqual({
			sprintNumber: 2,
			startDate: "2026-10-17",
			reviewDate: "2026-10-24",
		});
	});

	it("counts and groups tasks", () => {
		const tasks = [
			{ sprintId: "a", status: "todo" as const },
			{ sprintId: "a", status: "done" as const },
			{ sprintId: "b", status: "in_progress" as const },
		];
		expect(VexTaskProgressCounts(tasks)).toEqual({
			todo: 1,
			inProgress: 1,
			done: 1,
			total: 3,
		});
		const grouped = VexTasksBySprintId(tasks);
		expect(grouped.a).toHaveLength(2);
		expect(grouped.b).toHaveLength(1);
	});
});
