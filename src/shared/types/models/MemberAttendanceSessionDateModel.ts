import { z } from "zod";
import { IsYYYY_MM_dd } from "../../utils/DateHelpers";

/**
 * Schema for a single session attendance members
 */
export const MemberAttendanceSessionDateModelSchema = z.strictObject({
	memberIds: z.array(z.string()),
	sessionDate: z
		.string()
		.refine((v) => IsYYYY_MM_dd(v) || !v, {
			error: "sessionDate must be YYYY-MM-DD",
		})
		.optional()
		.prefault(""),
});

/**
 * Model for a single session attendance members
 */
export type MemberAttendanceSessionDateModel = z.infer<
	typeof MemberAttendanceSessionDateModelSchema
>;
