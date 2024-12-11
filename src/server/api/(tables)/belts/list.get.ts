import { defineEventHandler, readBody } from "#imports";
import { eq } from "drizzle-orm";
import { BeltEntity, ToBeltModels } from "~~/server/db/entities";
import { belts } from "~~/server/db/schema/schemas";
import { DrizzleType, UseDrizzle } from "~~/server/db/UseDrizzle";
import { ApiResponse } from "~~/shared/types/ApiResponse";
import { BeltModel } from "~~/shared/types/models/BeltModel";

type ResponseBody = ApiResponse<BeltModel[]>;

/**
 * GET: api/belts/list
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
		const db: DrizzleType = UseDrizzle();
		const includeDeleted: boolean = include_deleted === "true";

		const beltsListQuery = db.select().from(belts).orderBy(belts.sortOrder);

		if (!includeDeleted) {
			beltsListQuery.where(eq(belts.deleted, false));
		}

		const beltsList: BeltEntity[] = await beltsListQuery.execute();

		resp.data = ToBeltModels(beltsList);
	} catch (error: any) {
		resp = {
			success: false,
			error: error.message,
			logs,
		};
	}

	return resp;
});
