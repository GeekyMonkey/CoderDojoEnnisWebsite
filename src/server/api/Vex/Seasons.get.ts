import { VexSeasonsData } from "#server/db/VexSeasonsData";
import { GetRequestMember } from "#server/utils/requestMember";
import type { VexSeasonModel } from "#shared/types/models/VexSeasonModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<VexSeasonModel[]>;

/**
 * GET: /api/Vex/Seasons
 * All VEX seasons (logged-in members only)
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	try {
		await GetRequestMember(event);
		return { success: true, data: await VexSeasonsData.GetSeasons(event) };
	} catch (error) {
		return { success: false, error: ErrorToString(error) };
	}
});
