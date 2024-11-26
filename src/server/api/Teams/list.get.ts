import { defineEventHandler, readBody } from "#imports";
import { asc, eq } from "drizzle-orm";
import { TeamEntity, ToTeamModel, ToTeamModels } from "~~/server/db/entities";
import { teams } from "~~/server/db/schema/schemas";
import {
	DrizzleTables,
	DrizzleType,
	UseDrizzle,
} from "~~/server/db/UseDrizzle";
import { ApiResponse } from "~~/shared/types/ApiResponse";
import { TeamModel } from "~~/shared/types/models/TeamModel";

type ResponseBody = ApiResponse<TeamModel[]>;

/**
 * GET: api/Teams
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const { req } = event.node;

	const { include_deleted } = getQuery(event);
	let resp: ResponseBody = {
		data: [],
		success: true,
	};

	try {
		const db: DrizzleType = UseDrizzle();
		const includeDeleted: boolean = include_deleted === "true";

		const teamsListQuery = db.select().from(teams).orderBy(teams.teamName);

		if (!includeDeleted) {
			teamsListQuery.where(eq(teams.deleted, false));
		}

		const teamsList: TeamEntity[] = await teamsListQuery;
		resp.data = ToTeamModels(teamsList);
	} catch (error: any) {
		resp = {
			success: false,
			error: error.message,
		};
	}

	return resp;
});
