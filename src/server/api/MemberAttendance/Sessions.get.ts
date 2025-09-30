import { MemberAttendancesData } from "~~/server/db/MemberAttendancesData";
import {
	type MemberAttendanceSessionsModel,
	MemberAttendanceSessionsModelSchema,
} from "~~/shared/types/models/MemberAttendanceSessionsModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<MemberAttendanceSessionsModel>;

/**
 * GET: api/memberAttendance/Sessions
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: MemberAttendanceSessionsModelSchema.parse({
			attendance_total: 0,
			sessionCount: 0,
			sessionStats: [],
		}),
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
		resp.data = MemberAttendanceSessionsModelSchema.parse({
			attendance_total,
			sessionCount,
			sessionStats,
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
