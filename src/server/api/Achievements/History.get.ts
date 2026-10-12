import { defineEventHandler, getQuery, createError } from "h3";
import type { H3Event } from "h3";
import { z } from "zod";
import { AchievementKindSchema, type AchievementReview } from "#shared/types/AchievementReview";
import type { ApiResponse } from "#shared/types/ApiResponse";
import { requireRequestMentor } from "#server/utils/requestMentor";
import { getAchievementReviews } from "#server/db/AchievementReviewsData";

const querySchema: z.ZodType<{ kind: "badge" | "belt"; memberId: string }> = z.strictObject({ kind: AchievementKindSchema, memberId: z.uuid() });

/** List a member's achievement history for an authenticated mentor. */
export default defineEventHandler(async (event: H3Event): Promise<ApiResponse<AchievementReview[]>> => {
	const { id, client } = await requireRequestMentor(event);
	const parsed: ReturnType<typeof querySchema.safeParse> = querySchema.safeParse(getQuery(event));
	if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "Invalid history request" });
	return { success: true, data: await getAchievementReviews(client, parsed.data.kind, parsed.data.memberId, id) };
});
