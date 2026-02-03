import { z } from "zod";
import { IsYYYY_MM_dd } from "../../utils/DateHelpers";

/**
 * Schema for a single session attendance summary
 */
export const MemberAttendanceSessionStatSchema = z.strictObject({
	date: z.string().refine(IsYYYY_MM_dd, {
		error: "date must be YYYY-MM-DD",
	}),
	mentor_count: z.number(),
	ninja_count: z.number(),
	total_count: z.number(),
});

/**
 * Schema for a collection of attendance sessions statistics
 */
export const MemberAttendanceSessionStatsCollectionSchema = z.strictObject({
	sessionCount: z.number(),
	sessionStats: z.array(MemberAttendanceSessionStatSchema),
	attendance_total: z.number(),
});

/**
 * Types for attendance sessions statistics
 */
export type MemberAttendanceSessionStat = z.infer<
	typeof MemberAttendanceSessionStatSchema
>;

/**
 * Types for a collection of attendance sessions statistics
 */
export type MemberAttendanceSessionStatsCollection = z.infer<
	typeof MemberAttendanceSessionStatsCollectionSchema
>;
