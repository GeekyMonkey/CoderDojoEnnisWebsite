import { defineEventHandler, readBody, createError } from "h3";
import type { H3Event } from "h3";
import { AchievementDecisionSchema } from "#shared/types/AchievementReview";
import type { ApiResponse } from "#shared/types/ApiResponse";
import { requireRequestMentor } from "#server/utils/requestMentor";
import { decideAchievement } from "#server/db/AchievementReviewsData";

/** Approve, reject or undo an application using the verified mentor identity. */
export default defineEventHandler(async (event: H3Event): Promise<ApiResponse<null>> => {
	const { id, client } = await requireRequestMentor(event);
	const body: unknown = await readBody(event);
	const parsed: ReturnType<typeof AchievementDecisionSchema.safeParse> = AchievementDecisionSchema.safeParse(body);
	if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "Invalid decision or missing notes" });
	await decideAchievement(client, id, parsed.data);
	return { success: true, data: null };
});
