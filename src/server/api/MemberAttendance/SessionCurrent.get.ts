import { MemberAttendancesData } from "~~/server/db/MemberAttendancesData";
import {
	type MemberAttendanceSessionCurrentModel,
	MemberAttendanceSessionCurrentModelSchema,
} from "~~/shared/types/models/MemberAttendanceSessionCurrentModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<MemberAttendanceSessionCurrentModel>;

/**
 * GET: api/memberAttendance/SessionCurrent
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: MemberAttendanceSessionCurrentModelSchema.parse({
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
		resp.data = MemberAttendanceSessionCurrentModelSchema.parse({
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
