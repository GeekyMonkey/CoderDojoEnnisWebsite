import { createError, defineEventHandler, getRouterParam, type H3Event } from "h3";
import { requireRequestParent } from "#server/utils/parentRequest";
import { maintenanceId } from "#server/utils/maintenanceRequest";
import { readChildAchievements } from "#server/db/ParentData";
import { AchievementKindSchema, AchievementReviewSchema, type AchievementReview } from "#shared/types/AchievementReview";
import type { ApiResponse } from "#shared/types/ApiResponse";
/** Return read-only child achievement history and the active definition catalogue. */
export default defineEventHandler(async(event:H3Event):Promise<ApiResponse<AchievementReview[]>>=>{
 const actor:Awaited<ReturnType<typeof requireRequestParent>> = await requireRequestParent(event); const kind:ReturnType<typeof AchievementKindSchema.safeParse> = AchievementKindSchema.safeParse(getRouterParam(event,"kind"));
 if(!kind.success) throw createError({statusCode:400,statusMessage:"Invalid achievement kind"});
 return {success:true,data:AchievementReviewSchema.array().parse(await readChildAchievements(actor,maintenanceId(event),kind.data))};
});
