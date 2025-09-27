import { TeamsData } from "~~/server/db/TeamsData";

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
	} catch (error: any) {
		resp = {
			success: false,
			error: error.message,
			logs,
		};
	}

	return resp;
});
