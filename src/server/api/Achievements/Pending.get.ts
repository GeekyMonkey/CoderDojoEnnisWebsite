import { defineEventHandler, getQuery, createError } from "h3";
import type { H3Event } from "h3";
import { AchievementKindSchema, type AchievementReview } from "#shared/types/AchievementReview";
import type { ApiResponse } from "#shared/types/ApiResponse";
import { requireRequestMentor } from "#server/utils/requestMentor";
import { getAchievementReviews } from "#server/db/AchievementReviewsData";

/** List pending applications for an authenticated mentor. */
export default defineEventHandler(async (event: H3Event): Promise<ApiResponse<AchievementReview[]>> => {
	const { client } = await requireRequestMentor(event);
	const parsed: ReturnType<typeof AchievementKindSchema.safeParse> = AchievementKindSchema.safeParse(getQuery(event).kind);
	if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "Invalid achievement kind" });
	return { success: true, data: await getAchievementReviews(client, parsed.data) };
});
