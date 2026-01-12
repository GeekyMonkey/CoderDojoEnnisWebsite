import { defineEventHandler, readBody } from "#imports";
import { MemberAttendancesData } from "~~/server/db/MemberAttendancesData";
import type { ApiResponse } from "~~/shared/types/ApiResponse";
import { DateStringSchema } from "~~/shared/utils/DateHelpers";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";
import { z } from "zod";

const requestSchema = z.strictObject({
	memberId: z.string().min(1, "memberId required"),
	sessionDate: DateStringSchema,
	present: z.boolean(),
});

type RequestBody = z.infer<typeof requestSchema>;

type ResponseBody = ApiResponse<{
	memberId: string;
	sessionDate: string;
	present: boolean;
}>;

/**
 * POST: /api/MemberAttendance/SetPresent
 * Idempotently sets a member present/absent for the provided session date.
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const logs: string[] = [];
	try {
		const body = await readBody<RequestBody>(event);
		const parsed = requestSchema.safeParse(body);
		if (!parsed.success) {
			logs.push("Validation error");
			return {
				success: false,
				error: parsed.error.issues.map((i) => i.message).join(", "),
				logs,
			};
		}

		const { memberId, sessionDate, present } = parsed.data;
		const ok = await MemberAttendancesData.SetMemberAttendancePresent(
			event,
			memberId,
			sessionDate,
			present,
		);
		if (!ok) {
			return {
				success: false,
				error: "Unable to update attendance",
				logs,
			};
		}

		return {
			success: true,
			data: { memberId, sessionDate, present },
			logs,
		};
	} catch (error) {
		const msg = ErrorToString(error);
		logs.push(msg);
		return {
			success: false,
			error: `[SetPresent] POST error: ${msg}`,
			logs,
		};
	}
});
