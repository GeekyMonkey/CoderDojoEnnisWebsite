import { defineEventHandler, setResponseHeader, type H3Event } from "h3";
import {
	requireRequestMember,
	type VerifiedMember,
} from "#server/utils/requestMember";
import { sessionFromRecords } from "#shared/types/models/SessionModel";
import type { SessionModel } from "#shared/types/models/SessionModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<SessionModel[]>;

/**
 * GET: api/sessions/list
 */
export default defineEventHandler(
	async (event: H3Event): Promise<ResponseBody> => {
		const actor: VerifiedMember = await requireRequestMember(event);
		setResponseHeader(event, "Cache-Control", "private, no-store");
		const logs: string[] = [];
		let resp: ResponseBody = {
			data: [],
			success: true,
			logs,
		};

		try {
			const { data, error } = await actor.readClient
				.schema("coderdojo")
				.from("sessions")
				.select("*")
				.eq("deleted", false)
				.order("session_date", { ascending: false });
			if (error) throw error;
			resp.data = sessionFromRecords(data ?? []);
		} catch (error) {
			resp = {
				success: false,
				error: ErrorToString(error),
				logs,
			};
		}

		return resp;
	},
);
