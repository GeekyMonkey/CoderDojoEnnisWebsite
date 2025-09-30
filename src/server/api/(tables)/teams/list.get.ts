import { TeamsData } from "~~/server/db/TeamsData";
import { ErrorToString } from "~~/shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<TeamModel[]>;

/**
 * GET: api/teams/list
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
		resp.data = await TeamsData.GetTeams(event, includeDeleted);
	} catch (error) {
		resp = {
			success: false,
			error: ErrorToString(error),
			logs,
		};
	}

	return resp;
});
