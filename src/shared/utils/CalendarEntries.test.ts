import { describe, expect, it } from "vitest";
import { calendarEntriesForView } from "./CalendarEntries";
import type { CalendarEntry, SessionType } from "../types/MemberCalendar";
/** Make a small dated entry for ordering and privacy checks. */
function entry(
	id: string,
	date: string,
	sessionType: SessionType = "CODING",
): CalendarEntry {
	return {
		id,
		sessionDate: date,
		sessionType,
		topic: "Entry",
		description: "",
	};
}
describe("Calendar tab ordering and leading highlights", (): void => {
	it("sorts today and future ascending without past entries", (): void => {
		const rows: CalendarEntry[] = [
			entry("2", "2026-10-15"),
			entry("1", "2026-10-14"),
			entry("3", "2026-10-13"),
		];
		expect(
			calendarEntriesForView(rows, "future", "2026-10-14", false).map(
				(row: CalendarEntry): string => row.id,
			),
		).toEqual(["1", "2"]);
	});
	it("sorts the previous year descending, excluding today and older dates", (): void => {
		const rows: CalendarEntry[] = [
			entry("old", "2025-10-13"),
			entry("boundary", "2025-10-14"),
			entry("recent", "2026-10-13"),
			entry("today", "2026-10-14"),
		];
		expect(
			calendarEntriesForView(rows, "past", "2026-10-14", false).map(
				(row: CalendarEntry): string => row.id,
			),
		).toEqual(["recent", "boundary"]);
	});
	it("filters hidden planning before choosing the first entry and allows leading notes", (): void => {
		const rows: CalendarEntry[] = [
			entry("hidden", "2026-10-14", "MENTOR_PLANNING"),
			entry("note", "2026-10-15", "NOTE"),
			entry("coding", "2026-10-16"),
		];
		expect(
			calendarEntriesForView(rows, "future", "2026-10-14", false)[0]?.id,
		).toBe("note");
		expect(
			calendarEntriesForView(rows, "future", "2026-10-14", true)[0]?.id,
		).toBe("hidden");
	});
	it("keeps all same-date entries with a stable ID order without mutating the input", (): void => {
		const rows: CalendarEntry[] = [
			entry("b", "2026-10-14"),
			entry("a", "2026-10-14"),
			entry("c", "2026-10-14", "NOTE"),
		];
		expect(
			calendarEntriesForView(rows, "future", "2026-10-14", true).map(
				(row: CalendarEntry): string => row.id,
			),
		).toEqual(["a", "b", "c"]);
		expect(rows[0]?.id).toBe("b");
		expect(calendarEntriesForView([], "past", "2026-10-14", true)).toEqual([]);
	});
});
