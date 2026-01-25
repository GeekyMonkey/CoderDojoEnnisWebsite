import { defineEventHandler, readBody } from "#imports";
import { AttendanceService, AttendanceServiceError } from "~~/server/services/AttendanceService";
import { MembersData } from "~~/server/db/MembersData";
import type { ApiResponse } from "~~/shared/types/ApiResponse";
import type { AttendanceSignInResponseModel } from "~~/shared/types/AttendanceModels";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

type RequestBody = { nfcTag: string; testing?: boolean };

/**
 * POST: /api/MemberAttendance/SignInNfcTag
 * Sign in a member by NFC tag value.
 */
export default defineEventHandler(
	async (event): Promise<ApiResponse<AttendanceSignInResponseModel>> => {
		const logs: string[] = [];
		try {
			const { nfcTag, testing } = await readBody<RequestBody>(event);
			if (!nfcTag) {
				return {
					success: false,
					error: "NFC tag required",
					logs,
				};
			}

			const member = await MembersData.GetMemberByNfcTag(event, nfcTag.trim());
			if (!member) {
				return {
					success: false,
					error: "No member found with provided NFC tag",
					logs,
				};
			}

			const attendanceService = new AttendanceService(event);
			const signInResponse = await attendanceService.signInMember(
				member,
				Boolean(testing),
			);
			return {
				success: true,
				data: signInResponse,
				logs,
			};
		} catch (err) {
			if (err instanceof AttendanceServiceError) {
				return { success: false, error: err.message, logs };
			}
			const message: string = ErrorToString(err);
			return {
				success: false,
				error: `[SignInNfcTag] POST error: ${message}`,
				logs: [...logs, message],
			};
		}
	},
);
