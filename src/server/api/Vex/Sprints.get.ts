import { VexSprintsData } from "#server/db/VexSprintsData";
import { GetRequestMember } from "#server/utils/requestMember";
import type { VexSprintModel } from "#shared/types/models/VexSprintModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<VexSprintModel[]>;

/**
 * GET: /api/Vex/Sprints
 * All VEX sprints across seasons (logged-in members only)
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	try {
		await GetRequestMember(event);
		return { success: true, data: await VexSprintsData.GetSprints(event) };
	} catch (error) {
		return { success: false, error: ErrorToString(error) };
	}
});
