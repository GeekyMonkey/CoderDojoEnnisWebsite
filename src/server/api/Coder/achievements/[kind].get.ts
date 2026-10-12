import { createError, defineEventHandler, getRouterParam, type H3Event } from "h3";
import { requireRequestCoder } from "#server/utils/coderRequest";
import { AchievementKindSchema, type AchievementReview } from "#shared/types/AchievementReview";
import { getAchievementReviews } from "#server/db/AchievementReviewsData";
import type { ApiResponse } from "#shared/types/ApiResponse";
/** Return the verified coder's own catalogue and history with review actions disabled. */
export default defineEventHandler(async(event:H3Event):Promise<ApiResponse<AchievementReview[]>> => {
 const actor:Awaited<ReturnType<typeof requireRequestCoder>> = await requireRequestCoder(event);
 const kind:ReturnType<typeof AchievementKindSchema.safeParse> = AchievementKindSchema.safeParse(getRouterParam(event,"kind"));
 if (!kind.success) throw createError({statusCode:400,statusMessage:"Invalid achievement kind"});
 const rows:AchievementReview[] = await getAchievementReviews(actor.client,kind.data,actor.id);
 return {success:true,data:rows.map((review:AchievementReview):AchievementReview=>({...review,canReview:false}))};
});
