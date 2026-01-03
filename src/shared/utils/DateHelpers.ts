/**
 * DateHelpers
 * Exposes helpers for formatting dates used across the app.
 */

import { z } from "zod";

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
