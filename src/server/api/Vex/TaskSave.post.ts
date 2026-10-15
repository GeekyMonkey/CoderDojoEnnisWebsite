import { VexSprintsData } from "#server/db/VexSprintsData";
import { VexTasksData } from "#server/db/VexTasksData";
import { GetRequestMember } from "#server/utils/requestMember";
import {
	type VexTaskModel,
	VexTaskSaveSchema,
} from "#shared/types/models/VexTaskModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

type ResponseBody = ApiResponse<VexTaskModel>;

/**
 * POST: /api/Vex/TaskSave
 * Create or update a sprint task and its owners (any logged-in member)
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	try {
		const member = await GetRequestMember(event);
		const parsed = VexTaskSaveSchema.safeParse(await readBody(event));
		if (!parsed.success) {
			return {
				success: false,
				error: parsed.error.issues.map((i) => i.message).join(", "),
			};
		}

		const sprint = await VexSprintsData.GetSprintById(
			event,
			parsed.data.sprintId,
		);
		if (!sprint) {
			return { success: false, error: "Sprint not found" };
		}
		if (parsed.data.id) {
			const existing = await VexTasksData.GetTaskById(event, parsed.data.id);
			if (!existing || existing.sprintId !== parsed.data.sprintId) {
				return { success: false, error: "Task not found" };
			}
		}

		return {
			success: true,
			data: await VexTasksData.SaveTask(event, parsed.data, member.id),
		};
	} catch (error) {
		return { success: false, error: ErrorToString(error) };
	}
});
