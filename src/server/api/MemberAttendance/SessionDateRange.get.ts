import { defineEventHandler, getQuery } from "h3";
import { MemberAttendancesData } from "~~/server/db/MemberAttendancesData";
import {
	type MemberAttendanceSessionDateModel,
	MemberAttendanceSessionDateModelSchema,
} from "~~/shared/types/models/MemberAttendanceSessionDateModel";
import { IsYYYY_MM_dd } from "~~/shared/utils/DateHelpers";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<MemberAttendanceSessionDateModel[]>;

/**
 * GET: api/memberAttendance/SessionDateRange?dateMin=YYYY-MM-DD&dateMax=YYYY-MM-DD
 * Get attendance session member IDs for each date in the specified range (inclusive).
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: [],
		success: true,
		logs,
	};

	try {
		const query = getQuery(event) as Record<string, unknown>;
		const dateMin = query.dateMin;
		const dateMax = query.dateMax;

		if (typeof dateMin !== "string" || !IsYYYY_MM_dd(dateMin)) {
			throw new Error("dateMin query param is required and must be YYYY-MM-DD");
		}
		if (typeof dateMax !== "string" || !IsYYYY_MM_dd(dateMax)) {
			throw new Error("dateMax query param is required and must be YYYY-MM-DD");
		}
		if (dateMin > dateMax) {
			throw new Error("dateMin must be <= dateMax");
		}

		const attendances =
			await MemberAttendancesData.GetMemberAttendancesForDateRange(
				event,
				dateMin,
				dateMax,
			);

		// Group by date
		const byDate = new Map<string, string[]>();
		for (const attendance of attendances) {
			const d = attendance.date || "";
			if (!d) continue;
			const arr = byDate.get(d);
			if (arr) {
				arr.push(attendance.memberId);
			} else {
				byDate.set(d, [attendance.memberId]);
			}
		}

		const sortedDates = [...byDate.keys()].sort();
		resp.data = sortedDates.map((d) =>
			MemberAttendanceSessionDateModelSchema.parse({
				sessionDate: d,
				memberIds: (byDate.get(d) || []).sort(),
			}),
		);
	} catch (error) {
		resp = {
			success: false,
			error: ErrorToString(error),
			logs,
		};
	}

	return resp;
});
