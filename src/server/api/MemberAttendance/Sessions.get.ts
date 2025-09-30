import { MemberAttendancesData } from "~~/server/db/MemberAttendancesData";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<{
	sessionCount: number;
	sessionStats: {
		date: string;
		mentor_count: number;
		ninja_count: number;
		total_count: number;
	}[];
	attendance_total: number;
}>;

/**
 * GET: api/memberAttendance/Sessions
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: {
			attendance_total: 0,
			sessionCount: 0,
			sessionStats: [],
		},
		success: true,
		logs,
	};

	try {
		const sessions =
			await MemberAttendancesData.GetAttendanceSessionStats(event);
		resp.data.sessionStats = sessions;
		resp.data.sessionCount = resp.data.sessionStats.length;
		resp.data.attendance_total = resp.data.sessionStats.reduce(
			(total, stat) => total + (stat.total_count || 0),
			0,
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
