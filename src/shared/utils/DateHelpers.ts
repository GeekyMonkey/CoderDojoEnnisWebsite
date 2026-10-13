/**
 * DateHelpers
 * Exposes helpers for formatting dates used across the app.
 */

import { z } from "zod";
import { Temporal } from "temporal-polyfill";

export type DateTimeValue = Date | number | string | Temporal.Instant;

type RelativeTimeUnit = "year" | "month" | "day" | "hour" | "minute" | "second";

const DEFAULT_TIME_ZONE: string = Temporal.Now.timeZoneId();

/** Convert a date, epoch millisecond value, ISO string, or Temporal instant to an instant. */
function toTemporalInstant(value: DateTimeValue): Temporal.Instant {
	if (value instanceof Temporal.Instant) return value;
	if (value instanceof Date) return Temporal.Instant.fromEpochMilliseconds(value.getTime());
	if (typeof value === "number") return Temporal.Instant.fromEpochMilliseconds(value);
	return Temporal.Instant.from(value);
}

/** Format a timestamp as a localized date. */
export function formatDate(value: DateTimeValue, locale: string, timeZone: string = DEFAULT_TIME_ZONE): string {
	return toTemporalInstant(value).toZonedDateTimeISO(timeZone).toLocaleString(locale, { dateStyle: "medium" });
}

/** Format a timestamp as a localized time. */
export function formatTime(value: DateTimeValue, locale: string, timeZone: string = DEFAULT_TIME_ZONE): string {
	return toTemporalInstant(value).toZonedDateTimeISO(timeZone).toLocaleString(locale, { timeStyle: "short" });
}

/** Format a timestamp as a localized date and time. */
export function formatDateTime(value: DateTimeValue, locale: string, timeZone: string = DEFAULT_TIME_ZONE): string {
	return toTemporalInstant(value).toZonedDateTimeISO(timeZone).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
}

/** Format a timestamp relative to now, such as “3 days ago” or “tomorrow”. */
export function formatRelativeTime(
	value: DateTimeValue,
	locale: string,
	now: DateTimeValue = Temporal.Now.instant(),
	timeZone: string = DEFAULT_TIME_ZONE,
): string {
	const target: Temporal.ZonedDateTime = toTemporalInstant(value).toZonedDateTimeISO(timeZone);
	const current: Temporal.ZonedDateTime = toTemporalInstant(now).toZonedDateTimeISO(timeZone);
	const duration: Temporal.Duration = current.until(target, { largestUnit: "year" });
	const units: RelativeTimeUnit[] = ["year", "month", "day", "hour", "minute", "second"];
	const amounts: number[] = [duration.years, duration.months, duration.days, duration.hours, duration.minutes, duration.seconds];
	const unitIndex: number = amounts.findIndex((amount: number): boolean => amount !== 0);
	const unit: RelativeTimeUnit = unitIndex < 0 ? "second" : units[unitIndex]!;
	const amount: number = unitIndex < 0 ? 0 : amounts[unitIndex]!;
	return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(amount, unit);
}

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function TodayYYYY_MM_dd(): string {
	const d = new Date();
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

export const DateStringSchema = z.string().refine(IsYYYY_MM_dd, {
	error: "date must be YYYY-MM-DD",
});
export type DateString = z.infer<typeof DateStringSchema>;

export const NumberToDate = (num: number): Date => {
	return new Date(num);
};

export const NumberToDateOrNull = (num: number | null): Date | null => {
	if (num === null) {
		return null;
	}
	return new Date(num);
};

export const DateToNumber = (date: Date): number => {
	return date.getTime();
};

export const DateToNumberOrNull = (date: Date | null): number | null => {
	if (date === null) {
		return null;
	}
	return date.getTime();
};

/**
 * Convert a JS Date to a DateString in YYYY-MM-DD format
 */
export const DateTotDateString = (date: Date | null): DateString | null => {
	if (!date) {
		return null;
	}
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
};

/**
 * Convert a unix timestamp to a DateString in YYYY-MM-DD format
 */
export const TimestampToDateString = (
	timestamp: number | null,
): DateString | null => {
	if (!timestamp) {
		return null;
	}
	const date = new Date(timestamp);
	return DateTotDateString(date);
};

/**
 * Validate a string is in YYYY-MM-DD format and represents a real calendar date.
 * Suitable to use as a predicate for zod.refine.
 */
export function IsYYYY_MM_dd(value: unknown): boolean {
	if (typeof value !== "string") {
		return false;
	}
	// Strict format check
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}
	try {
		// Treat as UTC date at midnight so comparisons are consistent across timezones
		const d = new Date(value + "T00:00:00Z");
		if (Number.isNaN(d.getTime())) {
			return false;
		}
		// Ensure round-trip back to YYYY-MM-DD matches input (catches invalid days like 2025-02-30)
		return d.toISOString().slice(0, 10) === value;
	} catch (err) {
		return false;
	}
}
