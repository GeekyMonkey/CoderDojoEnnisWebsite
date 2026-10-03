import { VexSeasonsData } from "#server/db/VexSeasonsData";
import { GetRequestMentor } from "#server/utils/requestMember";
import {
	type VexSeasonModel,
	VexSeasonSaveSchema,
} from "#shared/types/models/VexSeasonModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<VexSeasonModel>;

/**
 * POST: /api/Vex/SeasonSave
 * Create or update a VEX season (mentors only)
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	try {
		await GetRequestMentor(event);
		const parsed = VexSeasonSaveSchema.safeParse(await readBody(event));
		if (!parsed.success) {
			return {
				success: false,
				error: parsed.error.issues.map((i) => i.message).join(", "),
			};
		}
		return {
			success: true,
			data: await VexSeasonsData.SaveSeason(event, parsed.data),
		};
	} catch (error) {
		return { success: false, error: ErrorToString(error) };
	}
});
