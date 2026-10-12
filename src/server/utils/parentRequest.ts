import { createError, getQuery, setResponseHeader, type H3Event } from "h3";
import { requireRequestMember, type VerifiedMember } from "./requestMember";
import { profileQuerySchema } from "#shared/types/MemberProfile";
import { memberFromRecord, type MemberModel } from "#shared/types/models/MemberModel";
/** Require a freshly verified parent and a strict empty query contract. */
export async function requireRequestParent(event:H3Event):Promise<VerifiedMember> {
 const actor:VerifiedMember = await requireRequestMember(event);
 if (!actor.member.isParent) throw createError({statusCode:403,statusMessage:"Parent access required"});
 if (!profileQuerySchema.safeParse(getQuery(event)).success) throw createError({statusCode:400,statusMessage:"Unexpected query fields"});
 setResponseHeader(event,"Cache-Control","private, no-store");
 return actor;
}
/** Verify an active child relationship before returning any private child data. */
export async function requireLinkedChild(actor:VerifiedMember,id:string):Promise<MemberModel> {
 if (!actor.member.isParent) throw createError({statusCode:403,statusMessage:"Parent access required"});
 const {data:link,error:linkError} = await actor.client.schema("coderdojo").from("member_parents").select("id").eq("parent_id",actor.id).eq("member_id",id).limit(1).maybeSingle();
 if(linkError) throw createError({statusCode:503,statusMessage:"Unable to verify child relationship"});
 if(!link) throw createError({statusCode:404,statusMessage:"Child unavailable"});
 const {data:member,error} = await actor.client.schema("coderdojo").from("members").select("*").eq("id",id).eq("deleted",false).eq("is_ninja",true).maybeSingle();
 if(error) throw createError({statusCode:503,statusMessage:"Unable to load child"});
 if(!member) throw createError({statusCode:404,statusMessage:"Child unavailable"});
 return memberFromRecord(member);
}
