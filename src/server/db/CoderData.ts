import { createError } from "h3";
import type { VerifiedMember } from "#server/utils/requestMember";
import { memberFromRecord } from "#shared/types/models/MemberModel";
import { teamFromRecord, type TeamModel } from "#shared/types/models/TeamModel";
import { coderContextSchema, publicMemberSchema, publicAwardSchema, teamMemberProfileSchema, type CoderContext, type TeamMemberProfile, type PublicMember } from "#shared/types/Coder";
import { getAchievementReviews } from "./AchievementReviewsData";
import type { AchievementReview } from "#shared/types/AchievementReview";
/** Read the current team and its public roster without exposing team maintenance notes. */
export async function readCoderContext(actor:VerifiedMember):Promise<CoderContext> {
 const teamId:string|null = actor.member.teamId;
 if (!teamId) return coderContextSchema.parse({member:actor.member,team:null,roster:[]});
 const {data:team,error:teamError} = await actor.client.schema("coderdojo").from("teams").select("*").eq("id",teamId).eq("deleted",false).maybeSingle();
 if (teamError) throw createError({statusCode:503,statusMessage:"Unable to load team"});
 if (!team) return coderContextSchema.parse({member:actor.member,team:null,roster:[]});
 const {data:members,error} = await actor.client.schema("coderdojo").from("members").select("*").eq("team_id",teamId).eq("deleted",false).order("name_first").order("name_last").order("id");
 if (error) throw createError({statusCode:503,statusMessage:"Unable to load team members"});
 const publicTeam:TeamModel = {...teamFromRecord(team),notes:null};
 return coderContextSchema.parse({member:actor.member,team:publicTeam,roster:(members??[]).filter((member:NonNullable<typeof members>[number]):boolean=>member.id!==actor.id).map((member:NonNullable<typeof members>[number]):unknown=>publicMemberSchema.parse(memberFromRecord(member)))});
}
/** Restrict a display-only profile to active members of the coder's current team. */
export async function readCoderTeamMember(actor:VerifiedMember,id:string):Promise<TeamMemberProfile> {
 const context:CoderContext = await readCoderContext(actor);
 const member:PublicMember|null = context.roster.find((value:PublicMember):boolean=>value.id===id)??(id===actor.id?publicMemberSchema.parse(actor.member):null);
 if (!context.team || !member) throw createError({statusCode:404,statusMessage:"Team member unavailable"});
 const [badges,belts]:[AchievementReview[],AchievementReview[]] = await Promise.all([getAchievementReviews(actor.client,"badge",id),getAchievementReviews(actor.client,"belt",id)]);
 return teamMemberProfileSchema.parse({member,team:context.team,roster:[publicMemberSchema.parse(actor.member),...context.roster].filter((value:PublicMember):boolean=>value.id!==id).sort((a:PublicMember,b:PublicMember):number=>(a.nameFirst??" ").localeCompare(b.nameFirst??" ") || (a.nameLast??" ").localeCompare(b.nameLast??" ") || a.id.localeCompare(b.id)),awards:[...belts,...badges].filter((review:AchievementReview):boolean=>review.awarded!==null).map((review:AchievementReview):unknown=>publicAwardSchema.parse(review))});
}
