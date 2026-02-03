import { MemberAttendancesData } from "~~/server/db/MemberAttendancesData";
import { MemberAttendanceSessionStatsCollectionSchema } from "~~/shared/types/models/MemberAttendanceSessionStatsModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<{ dates: string[] }>;

/**
 * GET: api/memberAttendance/SessionDates
 * Get attendance session date list
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: {
			dates: [],
		},
		success: true,
		logs,
	};

	try {
		const sessions =
			await MemberAttendancesData.GetAttendanceSessionStats(event);
		const sessionStats = sessions;
		const sessionCount = sessionStats.length;
		const attendance_total = sessionStats.reduce(
			(total, stat) => total + (stat.total_count || 0),
			0,
		);
		const dates: string[] = MemberAttendanceSessionStatsCollectionSchema.parse({
			attendance_total,
			sessionCount,
			sessionStats,
		})
			.sessionStats.map((s) => s.date)
			.sort((a, b) => b.localeCompare(a));
		resp.data = { dates };
	} catch (error) {
		resp = {
			success: false,
			error: ErrorToString(error),
			logs,
		};
	}

	return resp;
});
