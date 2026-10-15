import { VexSprintsData } from "#server/db/VexSprintsData";
import { GetRequestMentor } from "#server/utils/requestMember";
import {
	type VexSprintModel,
	VexSprintSaveSchema,
} from "#shared/types/models/VexSprintModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<VexSprintModel>;

/**
 * POST: /api/Vex/SprintSave
 * Create or update a weekly sprint / macro objective (mentors only)
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	try {
		const mentor = await GetRequestMentor(event);
		const parsed = VexSprintSaveSchema.safeParse(await readBody(event));
		if (!parsed.success) {
			return {
				success: false,
				error: parsed.error.issues.map((i) => i.message).join(", "),
			};
		}
		return {
			success: true,
			data: await VexSprintsData.SaveSprint(event, parsed.data, mentor.id),
		};
	} catch (error) {
		return { success: false, error: ErrorToString(error) };
	}
});
