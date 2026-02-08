import { MemberBeltsData } from "#server/db/MemberBeltsData";
import type { MemberBeltWithBeltDetailModel } from "#shared/types/models/MemberBeltModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";
import { ApiResponse } from "#shared/types/ApiResponse";

type ResponseBody = ApiResponse<MemberBeltWithBeltDetailModel[]>;

/**
 * GET: /api/memberBelts/byMemberId?memberId=:memberId
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: [],
		success: true,
		logs,
	};

	try {
		const query = getQuery(event) as Record<string, unknown>;
		const memberId = query.memberId;

		if (typeof memberId !== "string" || memberId.trim().length === 0) {
			throw new Error("memberId query param is required");
		}

		resp.data = await MemberBeltsData.GetMemberBeltsByMemberId(event, memberId);
	} catch (error) {
		resp = {
			success: false,
			error: ErrorToString(error),
			logs,
		};
	}

	return resp;
});
