import { VexResourcesData } from "#server/db/VexResourcesData";
import { GetRequestMember } from "#server/utils/requestMember";
import type { VexResourceModel } from "#shared/types/models/VexResourceModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<VexResourceModel[]>;

/**
 * GET: /api/Vex/Resources
 * All VEX resources. Inactive ones are only returned to mentors.
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	try {
		const member = await GetRequestMember(event);
		const resources: VexResourceModel[] =
			await VexResourcesData.GetResources(event);
		return {
			success: true,
			data: member.isMentor ? resources : resources.filter((r) => r.isActive),
		};
	} catch (error) {
		return { success: false, error: ErrorToString(error) };
	}
});
