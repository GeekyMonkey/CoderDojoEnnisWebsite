import { defineEventHandler, readBody } from "#imports";
import { eq } from "drizzle-orm";
import {
	BadgeCategoryEntity,
	ToBadgeCategoryModels,
} from "~~/server/db/entities";
import { badgeCategories } from "~~/server/db/schema/schemas";
import { DrizzleType, UseDrizzle } from "~~/server/db/UseDrizzle";
import { ApiResponse } from "~~/shared/types/ApiResponse";
import { BadgeCategoryModel } from "~~/shared/types/models/BadgeCategoryModel";

type ResponseBody = ApiResponse<BadgeCategoryModel[]>;

/**
 * GET: api/badgecatories/list
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

		const badgecatoriesListQuery = db
			.select()
			.from(badgeCategories)
			.orderBy(badgeCategories.categoryName);

		if (!includeDeleted) {
			badgecatoriesListQuery.where(eq(badgeCategories.deleted, false));
		}

		const badgecategoriesList: BadgeCategoryEntity[] =
			await badgecatoriesListQuery.execute();

		resp.data = ToBadgeCategoryModels(badgecategoriesList);
	} catch (error: any) {
		resp = {
			success: false,
			error: error.message,
			logs,
		};
	}

	return resp;
});
