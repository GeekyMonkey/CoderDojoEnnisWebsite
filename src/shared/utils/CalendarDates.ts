import { Temporal } from "temporal-polyfill";

/** Return the club date independently of the server or browser timezone. */
export function clubToday(
	now: Temporal.Instant = Temporal.Now.instant(),
): string {
	return now.toZonedDateTimeISO("Europe/Dublin").toPlainDate().toString();
}

/** Choose the inclusive lower date bound, clamping leap-day subtraction. */
export function calendarLowerBound(
	includePast: boolean,
	today: string = clubToday(),
): string {
	return includePast
		? Temporal.PlainDate.from(today).subtract({ years: 1 }).toString()
		: today;
}
