import { defineEventHandler, readBody } from "#imports";
import { eq } from "drizzle-orm";
import { TeamEntity, ToTeamModels } from "~~/server/db/entities";
import { teams } from "~~/server/db/schema/schemas";
import { DrizzleType, UseDrizzle } from "~~/server/db/UseDrizzle";
import { ApiResponse } from "~~/shared/types/ApiResponse";
import { TeamModel } from "~~/shared/types/models/TeamModel";

type ResponseBody = ApiResponse<TeamModel[]>;

/**
 * GET: api/teams/list
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const { include_deleted } = getQuery(event);
	const includeDeleted: boolean = include_deleted === "true";
	const config = useRuntimeConfig();

	const logs: string[] = [];
	let resp: ResponseBody = {
		data: [],
		success: true,
		logs,
	};

	logs.push("api/teams/list: " + JSON.stringify({ include_deleted }));
	try {
		const db: DrizzleType = UseDrizzle(event);
		logs.push("Got drizzle");

		// ToDo: RemoveSleep for 1 second
		await new Promise((resolve) => setTimeout(resolve, 1000));
		logs.push("Did nap (ToDo: Remove)");

		const teamsListQuery = db.select().from(teams).orderBy(teams.teamName);

		if (!includeDeleted) {
			teamsListQuery.where(eq(teams.deleted, false));
		}
		logs.push("Built query");

		const teamsList: TeamEntity[] = await teamsListQuery.execute();
		logs.push("ran query");

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
