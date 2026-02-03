import { MemberBeltsData } from "#server/db/MemberBeltsData";
import type { MemberBeltModel } from "#shared/types/models/MemberBeltModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<MemberBeltModel[]>;

/**
 * GET: /api/memberBelts/list
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: [],
		success: true,
		logs,
	};

	try {
		resp.data = await MemberBeltsData.GetMemberBelts(event);
	} catch (error) {
		resp = {
			success: false,
			error: ErrorToString(error),
			logs,
		};
	}

	return resp;
});
