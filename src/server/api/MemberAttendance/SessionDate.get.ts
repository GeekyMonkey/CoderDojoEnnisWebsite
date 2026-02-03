import { defineEventHandler, getQuery } from "h3";
import { MemberAttendancesData } from "~~/server/db/MemberAttendancesData";
import {
	type MemberAttendanceSessionDateModel,
	MemberAttendanceSessionDateModelSchema,
} from "~~/shared/types/models/MemberAttendanceSessionDateModel";
import { IsYYYY_MM_dd } from "~~/shared/utils/DateHelpers";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<MemberAttendanceSessionDateModel>;

/**
 * GET: api/memberAttendance/SessionDate?sessionDate=YYYY-MM-DD
 * Get attendance session info for a specified session date.
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: MemberAttendanceSessionDateModelSchema.parse({
			memberIds: [],
			sessionDate: "",
		}),
		success: true,
		logs,
	};

	try {
		const query = getQuery(event) as Record<string, unknown>;
		const rawDate = query.sessionDate ?? query.date;

		if (typeof rawDate !== "string" || !IsYYYY_MM_dd(rawDate)) {
			throw new Error(
				"sessionDate query param is required and must be YYYY-MM-DD",
			);
		}

		const attendance = await MemberAttendancesData.GetMemberAttendancesForDate(
			event,
			rawDate,
		);

		resp.data = MemberAttendanceSessionDateModelSchema.parse({
			memberIds: attendance.map((a) => a.memberId),
			sessionDate: rawDate,
		});
	} catch (error) {
		resp = {
			success: false,
			error: ErrorToString(error),
			logs,
		};
	}

	return resp;
});
