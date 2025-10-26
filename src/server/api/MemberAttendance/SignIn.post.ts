import { defineEventHandler, readBody } from "#imports";
import { AttendanceService } from "~~/server/services/AttendanceService";
import { AuthService, AuthServiceError } from "~~/server/services/AuthService";
import type { ApiResponse } from "~~/shared/types/ApiResponse";
import type { AttendanceSignInResponseModel } from "~~/shared/types/AttendanceModels";

type RequestBody = { username: string; password: string };

/**
 * POST: /api/MemberAttendance/SignIn
 * Signing in for attendance via username (login/email or first+last) and password.
 * Accepts username (login/email or first+last) and password, validates against members table.
 * Passwords stored as deterministic hash (GeneratePasswordHash). Members with deleted=true are excluded.
 */
export default defineEventHandler(
	async (event): Promise<ApiResponse<AttendanceSignInResponseModel>> => {
		const logs: string[] = [];
		try {
			const { username, password } = await readBody<RequestBody>(event);
			if (!username || !password) {
				return {
					success: false,
					error: "Username and password required",
					logs,
				};
			}

			const authService = new AuthService(event);
			const { member } = await authService.validateCredentials(
				username,
				password,
				logs,
			);

			const attendanceService = new AttendanceService(event);
			const signInResponse = await attendanceService.signInMember(member);
			return {
				success: true,
				data: signInResponse,
				logs,
			};
		} catch (err) {
			// Sign-in failed (wrong password, etc)
			if (err instanceof AuthServiceError) {
				return {
					success: false,
					error: err.message,
					logs: err.logs,
				};
			}
			const message: string = ErrorToString(err);
			return {
				success: false,
				error: `[Login] POST error: ${message}`,
				logs: [message],
			};
		}
	},
);
