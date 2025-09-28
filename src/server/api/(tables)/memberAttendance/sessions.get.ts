import { MemberAttendancesData } from "~~/server/db/MemberAttendancesData";

type ResponseBody = ApiResponse<{
	sessionCount: number,
	sessionDates: string[]
}>;

/**
 * GET: api/memberAttendance/sessions
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: {
			sessionCount: 0,
			sessionDates: []
		},
		success: true,
		logs,
	};

	try {
		const sessions = await MemberAttendancesData.GetAttendanceSessionDates(event);
		resp.data.sessionDates = sessions;
		resp.data.sessionCount = resp.data.sessionDates.length;
	} catch (error: any) {
		resp = {
			success: false,
			error: error.message,
			logs,
		};
	}

	return resp;
});
