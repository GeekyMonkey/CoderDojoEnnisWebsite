import { createError } from "h3";
import type { VerifiedMember } from "#server/utils/requestMember";
import { requireLinkedChild } from "#server/utils/parentRequest";
import { memberFromRecord, type MemberModel } from "#shared/types/models/MemberModel";
import { childSummarySchema, parentChildSchema, parentContactSchema, type ChildSummary, type ParentChild } from "#shared/types/Parent";
import { readCoderContext, readCoderTeamMember } from "./CoderData";
import { getAchievementReviews } from "./AchievementReviewsData";
import { readMemberAttendance } from "./MemberMaintenanceData";
import type { AchievementKind, AchievementReview } from "#shared/types/AchievementReview";
import type { TeamMemberProfile } from "#shared/types/Coder";

/** Read linked-child achievement evidence with mentor display names and no review permissions. */
export async function readChildAchievements(actor:VerifiedMember,id:string,kind:AchievementKind):Promise<AchievementReview[]> {
 await requireLinkedChild(actor,id);
 const rows:AchievementReview[] = await getAchievementReviews(actor.client,kind,id);
 const ids:string[] = [...new Set(rows.flatMap((row:AchievementReview):string[]=>[row.awardedByAdultId,row.rejectedByAdultId].filter((value:string|null):value is string=>value!==null)))];
 const {data:mentors,error} = ids.length ? await actor.client.schema("coderdojo").from("members").select("id,name_first,name_last").in("id",ids) : {data:[],error:null};
 if(error) throw createError({statusCode:503,statusMessage:"Unable to load mentor names"});
 const names:Record<string,string> = Object.fromEntries((mentors??[]).map((member:NonNullable<typeof mentors>[number]):[string,string]=>[member.id,`${member.name_first??""} ${member.name_last??""}`.trim()]));
 return rows.map((row:AchievementReview):AchievementReview=>({...row,canReview:false,awardedByName:names[row.awardedByAdultId??""]??null,rejectedByName:names[row.rejectedByAdultId??""]??null}));
}
/** Build a private child summary through a deliberately narrow response schema. */
async function childSummary(actor:VerifiedMember,member:MemberModel):Promise<ChildSummary> {
 const [belts,attendance] = await Promise.all([getAchievementReviews(actor.client,"belt",member.id),readMemberAttendance(actor,member.id)]);
 const current:AchievementReview|null = [...belts].filter((row:AchievementReview):boolean=>row.awarded!==null).sort((a:AchievementReview,b:AchievementReview):number=>(b.awarded??0)-(a.awarded??0))[0]??null;
 return childSummarySchema.parse({member,currentBelt:current?.belt??null,attendanceCount:new Set(attendance.map((row):string=>row.date)).size});
}
/** Return active linked children in stable name order, with no fabricated child navigation. */
export async function readChildren(actor:VerifiedMember):Promise<ChildSummary[]> {
 const {data:links,error:linkError} = await actor.client.schema("coderdojo").from("member_parents").select("member_id").eq("parent_id",actor.id);
 if(linkError) throw createError({statusCode:503,statusMessage:"Unable to load children"});
 const ids:string[] = [...new Set((links??[]).flatMap((link):string[]=>link.member_id?[link.member_id]:[]))];
 if(!ids.length) return [];
 const {data,error} = await actor.client.schema("coderdojo").from("members").select("*").in("id",ids).eq("deleted",false).eq("is_ninja",true).order("name_first").order("name_last").order("id");
 if(error) throw createError({statusCode:503,statusMessage:"Unable to load children"});
 return Promise.all((data??[]).map((record):Promise<ChildSummary>=>childSummary(actor,memberFromRecord(record))));
}
/** Compose child summary, safe team roster and the child's linked parent contact directory. */
export async function readChild(actor:VerifiedMember,id:string):Promise<ParentChild> {
 const member:MemberModel = await requireLinkedChild(actor,id);
 const [summary,context,links] = await Promise.all([childSummary(actor,member),readCoderContext({...actor,id,member}),actor.client.schema("coderdojo").from("member_parents").select("parent_id").eq("member_id",id)]);
 if(links.error) throw createError({statusCode:503,statusMessage:"Unable to load linked parents"});
 const ids:string[] = [...new Set((links.data??[]).flatMap((link):string[]=>link.parent_id?[link.parent_id]:[]))];
 const {data:parents,error} = ids.length?await actor.client.schema("coderdojo").from("members").select("*").in("id",ids).eq("deleted",false).eq("is_parent",true).order("name_first").order("name_last").order("id"):{data:[],error:null};
 if(error) throw createError({statusCode:503,statusMessage:"Unable to load parent contacts"});
 return parentChildSchema.parse({...summary,team:context.team,roster:context.roster,parents:(parents??[]).map((record):unknown=>parentContactSchema.parse(memberFromRecord(record)))});
}
/** Restrict peer profiles to the current teams of the parent's active linked children. */
export async function readParentPeer(actor:VerifiedMember,id:string):Promise<TeamMemberProfile> {
 const children:ChildSummary[] = await readChildren(actor);
 for(const child of children){
  if(!child.member.teamId) continue;
  const member:MemberModel = await requireLinkedChild(actor,child.member.id);
  const context:Awaited<ReturnType<typeof readCoderContext>> = await readCoderContext({...actor,id:member.id,member});
  if(member.id===id || context.roster.some((peer):boolean=>peer.id===id)) return readCoderTeamMember({...actor,id:member.id,member},id);
 }
 throw createError({statusCode:404,statusMessage:"Team member unavailable"});
}
