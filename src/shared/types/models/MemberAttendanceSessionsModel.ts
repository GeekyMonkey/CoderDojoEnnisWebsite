import { z } from "zod";
import { IsYYYY_MM_dd } from "../../utils/DateHelpers";

export const MemberAttendanceSessionStatSchema = z.strictObject({
		date: z
			.string()
			.refine(IsYYYY_MM_dd, {
                error: "date must be YYYY-MM-DD"
            }),
		mentor_count: z.number(),
		ninja_count: z.number(),
		total_count: z.number(),
	});

export const MemberAttendanceSessionsModelSchema = z.strictObject({
		sessionCount: z.number(),
		sessionStats: z.array(MemberAttendanceSessionStatSchema),
		attendance_total: z.number(),
	});

export type MemberAttendanceSessionStat = z.infer<
	typeof MemberAttendanceSessionStatSchema
>;
export type MemberAttendanceSessionsModel = z.infer<
	typeof MemberAttendanceSessionsModelSchema
>;
