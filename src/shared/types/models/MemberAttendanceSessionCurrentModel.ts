import { z } from "zod";
import { IsYYYY_MM_dd } from "../../utils/DateHelpers";

// Schema and type for the current session attendance summary
export const MemberAttendanceSessionCurrentModelSchema = z
	.object({
		memberIds: z.array(z.string()),
		sessionDate: z
			.string()
			.refine((v) => IsYYYY_MM_dd(v) || !v, {
				message: "sessionDate must be YYYY-MM-DD",
			})
			.optional()
			.default(""),
	})
	.strict();

export type MemberAttendanceSessionCurrentModel = z.infer<
	typeof MemberAttendanceSessionCurrentModelSchema
>;
