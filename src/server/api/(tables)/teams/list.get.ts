// import { defineEventHandler, readBody } from "#imports";
// import { eq } from "drizzle-orm";
// import { TeamEntity, ToTeamModels } from "~~/server/db/entities";
// import { teams } from "~~/server/db/schema/schemas";
// import { DrizzleType, UseDrizzle } from "~~/server/db/UseDrizzle";
// import { ApiResponse } from "~~/shared/types/ApiResponse";
// import { TeamModel } from "~~/shared/types/models/TeamModel";

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
