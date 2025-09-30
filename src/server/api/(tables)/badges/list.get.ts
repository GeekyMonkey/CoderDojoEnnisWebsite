import { BadgesData } from "~~/server/db/BadgesData";
import { BadgeModel } from "~~/shared/types/models/BadgeModel";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<BadgeModel[]>;

/**
 * GET: api/teams/badges/list
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
		resp.data = await BadgesData.GetBadges(event, includeDeleted);
	} catch (error) {
		resp = {
			success: false,
			error: ErrorToString(error),
			logs,
		};
	}

	return resp;
});
