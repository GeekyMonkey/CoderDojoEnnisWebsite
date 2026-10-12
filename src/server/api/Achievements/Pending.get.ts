import { defineEventHandler, getQuery, createError } from "h3";
import { z } from "zod";
import type { H3Event } from "h3";
import { AchievementKindSchema, type AchievementKind, type AchievementReview } from "#shared/types/AchievementReview";
import type { ApiResponse } from "#shared/types/ApiResponse";
import { requireRequestMentor } from "#server/utils/requestMentor";
import { getAchievementReviews } from "#server/db/AchievementReviewsData";

const QUERY_SCHEMA: z.ZodType<{ kind: AchievementKind }> = z.strictObject({ kind: AchievementKindSchema });

/** List pending applications for an authenticated mentor. */
export default defineEventHandler(async (event: H3Event): Promise<ApiResponse<AchievementReview[]>> => {
	const { id, client } = await requireRequestMentor(event);
	const parsed: ReturnType<typeof QUERY_SCHEMA.safeParse> = QUERY_SCHEMA.safeParse(getQuery(event));
	if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "Invalid achievement kind" });
	return { success: true, data: await getAchievementReviews(client, parsed.data.kind, undefined, id) };
});
