import { SessionsData } from "#server/db/SessionsData";
import type { SessionModel } from "#shared/types/models/SessionModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<SessionModel[]>;

/**
 * GET: api/sessions/list
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: [],
		success: true,
		logs,
	};

	try {
		resp.data = await SessionsData.GetSessions(event);
	} catch (error) {
		resp = {
			success: false,
			error: ErrorToString(error),
			logs,
		};
	}

	return resp;
});
