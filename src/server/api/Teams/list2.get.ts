import { defineEventHandler, readBody } from "#imports";
import { eq } from "drizzle-orm";
import { TeamEntity, ToTeamModel, ToTeamModels } from "~~/server/db/entities";
import { teams } from "~~/server/db/schema/schemas";
import { DrizzleType, UseDrizzle } from "~~/server/db/UseDrizzle";
import { ApiResponse } from "~~/shared/types/ApiResponse";
import { TeamModel } from "~~/shared/types/models/TeamModel";

type ResponseBody = ApiResponse<TeamModel[]>;

/**
 * GET: api/Teams/list2
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const { include_deleted, blank } = getQuery(event);
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: [],
		success: true,
		logs,
	};

	if (blank) {
		logs.push("Blank request");
		return resp;
	}

	try {
		const includeDeleted: boolean = include_deleted === "true";
		logs.push(`Include deleted: ${includeDeleted}`);

		const teamsList: TeamEntity[] = [
			{
				id: "1",
				teamName: "Team 1",
				deleted: false,
				notes: "Team 1 description",
				goal: null,
				hexcode: null,
			},
			{
				id: "2",
				teamName: "Team 2",
				deleted: false,
				notes: "Team 2 description",
				goal: null,
				hexcode: null,
			},
		];
		resp.data = ToTeamModels(teamsList);
	} catch (error: any) {
		resp = {
			success: false,
			error: error.message,
			logs,
		};
	}

	return resp;
});
