import { VexResourcesData } from "#server/db/VexResourcesData";
import { GetRequestMentor } from "#server/utils/requestMember";
import {
	type VexResourceModel,
	VexResourceSaveSchema,
} from "#shared/types/models/VexResourceModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<VexResourceModel>;

/**
 * POST: /api/Vex/ResourceSave
 * Create or update a VEX resource link (mentors only)
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	try {
		await GetRequestMentor(event);
		const parsed = VexResourceSaveSchema.safeParse(await readBody(event));
		if (!parsed.success) {
			return {
				success: false,
				error: parsed.error.issues.map((i) => i.message).join(", "),
			};
		}
		return {
			success: true,
			data: await VexResourcesData.SaveResource(event, parsed.data),
		};
	} catch (error) {
		return { success: false, error: ErrorToString(error) };
	}
});
