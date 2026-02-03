import { MembersData } from "#server/db/MembersData";
import { MemberModel } from "#shared/types/models/MemberModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<MemberModel[]>;

/**
 * GET: api/members/list
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const { include_deleted } = getQuery(event);
	const includeDeleted: boolean = include_deleted === "true";

	const logs: string[] = [];
	let resp: ResponseBody = {
		data: [],
		success: true,
		logs,
	};

	try {
		resp.data = await MembersData.GetMembers(event, includeDeleted);
	} catch (error) {
		resp = {
			success: false,
			error: ErrorToString(error),
			logs,
		};
	}

	return resp;
});
