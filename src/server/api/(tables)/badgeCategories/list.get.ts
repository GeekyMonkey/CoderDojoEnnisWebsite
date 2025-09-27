import { BadgeCategoriesData } from "~~/server/db/BadgeCategoriesData";
import { BadgeCategoryModel } from "~~/shared/types/models/BadgeCategoryModel";

type ResponseBody = ApiResponse<BadgeCategoryModel[]>;

/**
 * GET: api/teams/badgeCatgegories/list
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
		resp.data = await BadgeCategoriesData.GetBadgeCategories(event, includeDeleted);
	} catch (error: any) {
		resp = {
			success: false,
			error: error.message,
			logs,
		};
	}

	return resp;
});
