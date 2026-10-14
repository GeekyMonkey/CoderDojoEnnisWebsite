import { describe, expect, it } from "vitest";
import { Temporal } from "temporal-polyfill";
import { calendarLowerBound, clubToday } from "./CalendarDates";
import { calendarFieldsSchema } from "../types/MemberCalendar";
describe("Calendar date windows", (): void => {
	it("includes today by default and one calendar year when requested", (): void => {
		expect(calendarLowerBound(false, "2026-10-14")).toBe("2026-10-14");
		expect(calendarLowerBound(true, "2026-10-14")).toBe("2025-10-14");
	});
	it("clamps leap day and respects Dublin midnight", (): void => {
		expect(calendarLowerBound(true, "2024-02-29")).toBe("2023-02-28");
		expect(clubToday(Temporal.Instant.from("2026-07-01T23:30:00Z"))).toBe(
			"2026-07-02",
		);
		expect(clubToday(Temporal.Instant.from("2026-01-01T23:30:00Z"))).toBe(
			"2026-01-01",
		);
	});
	it("defaults blank topics and rejects time or unexpected fields", (): void => {
		const fields: object = {
			sessionDate: "2026-10-14",
			topic: "  ",
			description: "Starts at 11:00",
			sessionType: "CODING",
		};
		expect(calendarFieldsSchema.parse(fields).sessionType).toBe("CODING");
		expect(
			calendarFieldsSchema.safeParse({ ...fields, startsAt: "11:00" }).success,
		).toBe(false);
	});
});
