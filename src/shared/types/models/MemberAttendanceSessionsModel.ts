import { z } from "zod";
import { IsYYYY_MM_dd } from "../../utils/DateHelpers";

export const MemberAttendanceSessionStatSchema = z
	.object({
		date: z
			.string()
			.refine(IsYYYY_MM_dd, { message: "date must be YYYY-MM-DD" }),
		mentor_count: z.number(),
		ninja_count: z.number(),
		total_count: z.number(),
	})
	.strict();

export const MemberAttendanceSessionsModelSchema = z
	.object({
		sessionCount: z.number(),
		sessionStats: z.array(MemberAttendanceSessionStatSchema),
		attendance_total: z.number(),
	})
	.strict();

export type MemberAttendanceSessionStat = z.infer<
	typeof MemberAttendanceSessionStatSchema
>;
export type MemberAttendanceSessionsModel = z.infer<
	typeof MemberAttendanceSessionsModelSchema
>;
