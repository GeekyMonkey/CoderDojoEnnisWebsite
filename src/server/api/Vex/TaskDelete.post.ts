import { VexTasksData } from "#server/db/VexTasksData";
import { GetRequestMember } from "#server/utils/requestMember";
import { ErrorToString } from "#shared/utils/ErrorHelpers";

const requestSchema = z.strictObject({
	id: z.string().min(1),
});

type ResponseBody = ApiResponse<{ id: string }>;

/**
 * POST: /api/Vex/TaskDelete
 * Remove a task. Allowed for the member who created it, or a mentor.
 */
export default defineEventHandler(async (event): Promise<ResponseBody> => {
	try {
		const member = await GetRequestMember(event);
		const parsed = requestSchema.safeParse(await readBody(event));
		if (!parsed.success) {
			return { success: false, error: "id required" };
		}

		const task = await VexTasksData.GetTaskById(event, parsed.data.id);
		if (!task) {
			return { success: false, error: "Task not found" };
		}
		if (!member.isMentor && task.createdByMemberId !== member.id) {
			return {
				success: false,
				error: "Only the person who added a task, or a mentor, can remove it",
			};
		}

		await VexTasksData.DeleteTask(event, task.id, member.id);
		return { success: true, data: { id: task.id } };
	} catch (error) {
		return { success: false, error: ErrorToString(error) };
	}
});
