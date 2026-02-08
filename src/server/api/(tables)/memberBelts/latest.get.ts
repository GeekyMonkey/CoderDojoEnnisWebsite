import { MemberBeltsData } from "#server/db/MemberBeltsData";
import type { MemberBeltModel } from "#shared/types/models/MemberBeltModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<MemberBeltModel[]>;

/**
 * GET: /api/memberBelts/latest
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: [],
		success: true,
		logs,
	};

	try {
		resp.data = await MemberBeltsData.GetLatestMemberBelts(event);
	} catch (error) {
		resp = {
			success: false,
			error: ErrorToString(error),
			logs,
		};
	}

	return resp;
});
