import { VexResourcesData } from "#server/db/VexResourcesData";
import { GetRequestMentor } from "#server/utils/requestMember";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

const requestSchema = z.strictObject({
	id: z.string().min(1),
});

type ResponseBody = ApiResponse<{ id: string }>;

/**
 * POST: /api/Vex/ResourceDelete
 * Remove a VEX resource link (mentors only)
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	try {
		await GetRequestMentor(event);
		const parsed = requestSchema.safeParse(await readBody(event));
		if (!parsed.success) {
			return { success: false, error: "id required" };
		}
		await VexResourcesData.DeleteResource(event, parsed.data.id);
		return { success: true, data: { id: parsed.data.id } };
	} catch (error) {
		return { success: false, error: ErrorToString(error) };
	}
});
