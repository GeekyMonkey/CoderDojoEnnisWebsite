import type { Session } from "@supabase/supabase-js";
import { defineEventHandler, readBody } from "#imports";
import { AuthService, AuthServiceError } from "~~/server/services/AuthService";
import type { ApiResponse } from "~~/shared/types/ApiResponse";
import type { MemberModel } from "~~/shared/types/models/MemberModel";
import type { LoginRequest } from "~~/shared/validation/AuthSchemas";
import { loginRequestSchema } from "~~/shared/validation/AuthSchemas";

type ResponseBody = { member: MemberModel | null; session: Session | null };

/**
 * POST: /api/Auth/Login
 * Accepts username (login/email or first+last) and password, validates against members table.
 * Passwords stored as deterministic hash (GeneratePasswordHash). Members with deleted=true are excluded.
 */
export default defineEventHandler(
	async (event): Promise<ApiResponse<ResponseBody>> => {
		const logs: string[] = [];
		try {
			const body = await readBody<LoginRequest>(event);
			const parsed = loginRequestSchema.safeParse(body);
			if (!parsed.success) {
				logs.push("Validation error");
				return {
					success: false,
					error: parsed.error.issues.map((i) => i.message).join(", "),
					logs,
				};
			}
			const { username, password } = parsed.data;

			const authService = new AuthService(event);
			const { member, session } = await authService.loginWithPassword(
				username,
				password,
				logs,
			);

			return {
				success: true,
				data: { member, session },
				logs,
			};
		} catch (err) {
			if (err instanceof AuthServiceError) {
				return { success: false, error: err.message, logs };
			}
			logs.push(ErrorToString(err));
			return {
				success: false,
				error: `[Login] POST error: ${ErrorToString(err)}`,
				logs,
			};
		}
	},
);
