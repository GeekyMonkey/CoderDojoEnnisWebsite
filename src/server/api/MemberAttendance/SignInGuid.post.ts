import { defineEventHandler, readBody } from "#imports";
import { AttendanceService } from "~~/server/services/AttendanceService";
import { MembersData } from "~~/server/db/MembersData";
import type { ApiResponse } from "~~/shared/types/ApiResponse";
import type { AttendanceSignInResponseModel } from "~~/shared/types/AttendanceModels";

type RequestBody = { memberGuid: string };

/**
 * POST: /api/MemberAttendance/SignInGuid
 * Signs in a member for attendance using their member GUID.
 */
export default defineEventHandler(
	async (event): Promise<ApiResponse<AttendanceSignInResponseModel>> => {
		const logs: string[] = [];
		try {
			const { memberGuid } = await readBody<RequestBody>(event);
			if (!memberGuid) {
				return {
					success: false,
					error: "Member GUID required",
					logs,
				};
			}

			const member = await MembersData.GetMemberById(event, memberGuid);
			if (!member || member.deleted) {
				return {
					success: false,
					error: "Member not found",
					logs,
				};
			}

			const attendanceService = new AttendanceService(event);
			const signInResponse = await attendanceService.signInMember(member);
			return {
				success: true,
				data: signInResponse,
				logs,
			};
		} catch (err) {
			const message: string = ErrorToString(err);
			return {
				success: false,
				error: `[LoginGuid] POST error: ${message}`,
				logs: [message],
			};
		}
	},
);
