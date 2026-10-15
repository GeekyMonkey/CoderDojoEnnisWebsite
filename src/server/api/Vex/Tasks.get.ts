import { VexTasksData } from "#server/db/VexTasksData";
import { GetRequestMember } from "#server/utils/requestMember";
import type { VexTaskModel } from "#shared/types/models/VexTaskModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<VexTaskModel[]>;

/**
 * GET: /api/Vex/Tasks?sprintId=... or ?seasonId=...
 * Tasks (with owners) for a sprint or a whole season (logged-in members only)
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	try {
		await GetRequestMember(event);
		const { sprintId, seasonId } = getQuery(event);
		const filter: { sprintId?: string; seasonId?: string } = {
			sprintId: typeof sprintId === "string" && sprintId ? sprintId : undefined,
			seasonId: typeof seasonId === "string" && seasonId ? seasonId : undefined,
		};
		if (!filter.sprintId && !filter.seasonId) {
			return { success: false, error: "sprintId or seasonId required" };
		}
		return { success: true, data: await VexTasksData.GetTasks(event, filter) };
	} catch (error) {
		return { success: false, error: ErrorToString(error) };
	}
});
