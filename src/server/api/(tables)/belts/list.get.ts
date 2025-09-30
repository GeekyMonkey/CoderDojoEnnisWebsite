import { BeltsData } from "~~/server/db/BeltsData";
import type { BeltModel } from "~~/shared/types/models/BeltModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

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
	} catch (error) {
		resp = {
			success: false,
			error: ErrorToString(error),
			logs,
		};
	}

	return resp;
});
