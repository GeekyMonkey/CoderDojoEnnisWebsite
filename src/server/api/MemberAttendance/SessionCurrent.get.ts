import { MemberAttendancesData } from "#server/db/MemberAttendancesData";
import {
	type MemberAttendanceSessionDateModel,
	MemberAttendanceSessionDateModelSchema,
} from "#shared/types/models/MemberAttendanceSessionDateModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<MemberAttendanceSessionDateModel>;

/**
 * GET: api/memberAttendance/SessionCurrent
 * Get the current attendance session (most recent session) info
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
		const attendance =
			await MemberAttendancesData.GetMemberAttendancesForMostRecentSession(
				event,
			);
		resp.data = MemberAttendanceSessionDateModelSchema.parse({
			memberIds: attendance.map((a) => a.memberId),
			sessionDate: attendance[0]?.date || "",
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
