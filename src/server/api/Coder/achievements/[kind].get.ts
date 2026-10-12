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
 const ids:string[] = [...new Set(rows.flatMap((review:AchievementReview):string[]=>[review.awardedByAdultId,review.rejectedByAdultId].filter((id:string|null):id is string=>id!==null)))];
 const {data:mentors,error} = ids.length?await actor.client.schema("coderdojo").from("members").select("id,name_first,name_last").in("id",ids):{data:[],error:null};
 if (error) throw createError({statusCode:503,statusMessage:"Unable to load mentor names"});
 const names:Record<string,string> = Object.fromEntries((mentors??[]).map((member:NonNullable<typeof mentors>[number]):[string,string]=>[member.id,`${member.name_first??""} ${member.name_last??""}`.trim()]));
 return {success:true,data:rows.map((review:AchievementReview):AchievementReview=>({...review,canReview:false,awardedByName:names[review.awardedByAdultId??""]??null,rejectedByName:names[review.rejectedByAdultId??""]??null}))};
});
