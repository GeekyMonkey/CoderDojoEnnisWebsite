import { defineEventHandler, readBody } from "#imports";
import type { ApiResponse } from "~~/shared/types/ApiResponse";
import { AuthService, AuthServiceError } from "~~/server/services/AuthService";
import type { MemberModel } from "~~/shared/types/models/MemberModel";
import { MembersData } from "~~/server/db/MembersData";
import {
	PasswordChangeRequest,
	passwordChangeRequestSchema,
} from "~~/shared/validation/AuthSchemas";

type ResponseBody = { member: MemberModel | null };

/**
 * POST: /api/Auth/PasswordChange
 * Accepts username (login/email or first+last) and oldPassword and newPassword, validates against members table.
 */
export default defineEventHandler(
	async (event): Promise<ApiResponse<ResponseBody>> => {
		const logs: string[] = [];
		try {
			const body = await readBody<PasswordChangeRequest>(event);
			const parsed = passwordChangeRequestSchema.safeParse(body);
			if (!parsed.success) {
				logs.push("Validation error");
				return {
					success: false,
					error: parsed.error.issues.map((i) => i.message).join(", "),
					logs,
				};
			}
			const { username, oldPassword, newPassword } = parsed.data;

			const authService = new AuthService(event);
			const { member } = await authService.validateCredentials(
				username,
				oldPassword,
				logs,
			);
			const updated = await MembersData.SetMemberPasswordHash(
				event,
				member.id,
				newPassword.trim(),
			);
			if (!updated) {
				return { success: false, error: "Unable to update password", logs };
			}
			logs.push("Password updated");
			return { success: true, data: { member }, logs };
		} catch (err: any) {
			if (err instanceof AuthServiceError) {
				return { success: false, error: err.message, logs };
			}
			logs.push(err?.message || "Unknown error");
			return {
				success: false,
				error:
					"[PasswordChange] POST error: " + (err?.message || "Unknown error"),
				logs,
			};
		}
	},
);
