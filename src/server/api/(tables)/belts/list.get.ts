import { BeltsData } from "~~/server/db/BeltsData";
import { BeltModel } from "~~/shared/types/models/BeltModel";

type ResponseBody = ApiResponse<BeltModel[]>;

/**
 * GET: api/teams/belts/list
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
		resp.data = await BeltsData.GetBelts(event, includeDeleted);
	} catch (error: any) {
		resp = {
			success: false,
			error: error.message,
			logs,
		};
	}

	return resp;
});
