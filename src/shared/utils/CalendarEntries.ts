import { calendarLowerBound } from "./CalendarDates";
import type { CalendarEntry, CalendarView } from "../types/MemberCalendar";
/** Filter permitted dates before choosing a deterministic leading entry in either tab. */
export function calendarEntriesForView(
	entries: CalendarEntry[],
	view: CalendarView,
	today: string,
	canViewPlanning: boolean,
): CalendarEntry[] {
	const lower: string = calendarLowerBound(view === "past", today);
	return entries
		.filter(
			(entry: CalendarEntry): boolean =>
				(canViewPlanning || entry.sessionType !== "MENTOR_PLANNING") &&
				entry.sessionDate >= lower &&
				(view === "future" || entry.sessionDate < today),
		)
		.slice()
		.sort(
			(left: CalendarEntry, right: CalendarEntry): number =>
				(view === "future"
					? left.sessionDate.localeCompare(right.sessionDate)
					: right.sessionDate.localeCompare(left.sessionDate)) ||
				left.id.localeCompare(right.id),
		);
}
