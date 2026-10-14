import { z } from "zod";
import { DateStringSchema } from "#shared/utils/DateHelpers";
import { coderSessionSchema } from "./CoderSession";

export const sessionTypeSchema = z.enum(["CODING", "MENTOR_PLANNING", "NOTE"]);
export type SessionType = z.infer<typeof sessionTypeSchema>;
export const calendarViewSchema = z.enum(["future", "past"]);
export type CalendarView = z.infer<typeof calendarViewSchema>;
export const DEFAULT_TOPICS: Record<SessionType, string> = {
	CODING: "Coding Session",
	MENTOR_PLANNING: "Mentor planning",
	NOTE: "Note",
};
export const SESSION_ICONS: Record<SessionType, string> = {
	CODING: "i-lucide-code-xml",
	MENTOR_PLANNING: "i-lucide-users-round",
	NOTE: "i-lucide-megaphone",
};
export const calendarFieldsSchema = z.strictObject({
	sessionDate: DateStringSchema,
	topic: z.string().trim().max(200),
	description: z.string().trim().max(4000),
	sessionType: sessionTypeSchema,
});
export const calendarEntrySchema = calendarFieldsSchema.extend({
	id: z.uuid(),
});
export const calendarSessionSchema = calendarEntrySchema.extend({
	revision: z.uuid(),
});
export const calendarUpdateSchema = z.strictObject({
	fields: calendarFieldsSchema,
	expected: z.uuid(),
});
export const calendarDeleteSchema = z.strictObject({ expected: z.uuid() });
export const calendarQuerySchema = z.strictObject({
	view: calendarViewSchema.default("future"),
});
export const calendarPodSchema = coderSessionSchema.extend({
	mentorsOnly: z.boolean(),
});
export const memberCalendarSchema = z.strictObject({
	sessions: z.array(calendarEntrySchema),
	pods: z.array(calendarPodSchema),
	isMentor: z.boolean(),
	today: DateStringSchema,
});
export type CalendarFields = z.infer<typeof calendarFieldsSchema>;
export type CalendarEntry = z.infer<typeof calendarEntrySchema>;
export type CalendarSession = z.infer<typeof calendarSessionSchema>;
export type CalendarUpdate = z.infer<typeof calendarUpdateSchema>;
export type CalendarDelete = z.infer<typeof calendarDeleteSchema>;
export type MemberCalendar = z.infer<typeof memberCalendarSchema>;
