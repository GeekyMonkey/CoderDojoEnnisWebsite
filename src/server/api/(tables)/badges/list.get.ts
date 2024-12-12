import { defineEventHandler, readBody } from "#imports";
import { eq } from "drizzle-orm";
import { BadgeEntity, ToBadgeModels } from "~~/server/db/entities";
import { badges } from "~~/server/db/schema/schemas";
import { DrizzleType, UseDrizzle } from "~~/server/db/UseDrizzle";
import { ApiResponse } from "~~/shared/types/ApiResponse";
import { BadgeModel } from "~~/shared/types/models/BadgeModel";

type ResponseBody = ApiResponse<BadgeModel[]>;

/**
 * GET: api/badges/list
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	const { include_deleted } = getQuery(event);
	const logs: string[] = [];
	let resp: ResponseBody = {
		data: [],
		success: true,
		logs,
	};

	try {
		const db: DrizzleType = UseDrizzle(event);
		const includeDeleted: boolean = include_deleted === "true";

		const badgesListQuery = db
			.select()
			.from(badges)
			.orderBy(badges.achievement);

		if (!includeDeleted) {
			badgesListQuery.where(eq(badges.deleted, false));
		}

		const badgesList: BadgeEntity[] = await badgesListQuery.execute();

		resp.data = ToBadgeModels(badgesList);
	} catch (error: any) {
		resp = {
			success: false,
			error: error.message,
			logs,
		};
	}

	return resp;
});
