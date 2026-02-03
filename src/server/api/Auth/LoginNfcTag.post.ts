import type { Session } from "@supabase/supabase-js";
import { defineEventHandler, readBody } from "#imports";
import { AuthService, AuthServiceError } from "#server/services/AuthService";
import type { ApiResponse } from "#shared/types/ApiResponse";
import type { MemberModel } from "#shared/types/models/MemberModel";
import type { LoginNfcTagRequest } from "#shared/validation/AuthSchemas";
import { loginNfcTagRequestSchema } from "#shared/validation/AuthSchemas";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = { member: MemberModel | null; session: Session | null };

/**
 * POST: /api/Auth/LoginNfcTag
 * Accepts NFC tag value and authenticates against members table.
 */
export default defineEventHandler(
	async (event): Promise<ApiResponse<ResponseBody>> => {
		const logs: string[] = [];
		try {
			const body = await readBody<LoginNfcTagRequest>(event);
			const parsed = loginNfcTagRequestSchema.safeParse(body);
			if (!parsed.success) {
				logs.push("Validation error");
				return {
					success: false,
					error: parsed.error.issues.map((i) => i.message).join(", "),
					logs,
				};
			}

			const authService = new AuthService(event);
			const { member, session } = await authService.loginWithNfcTag(
				parsed.data.nfcTag,
				logs,
			);

			return {
				success: true,
				data: { member, session },
				logs,
			};
		} catch (err) {
			if (err instanceof AuthServiceError) {
				return { success: false, error: err.message, logs: err.logs };
			}
			logs.push(ErrorToString(err));
			return {
				success: false,
				error: `[LoginNfcTag] POST error: ${ErrorToString(err)}`,
				logs,
			};
		}
	},
);
