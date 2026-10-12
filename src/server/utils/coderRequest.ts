import { createError, getQuery, setResponseHeader, type H3Event } from "h3";
import { requireRequestMember, type VerifiedMember } from "./requestMember";
import { profileQuerySchema } from "#shared/types/MemberProfile";
/** Verify the current database coder role and reject unrecognized query input. */
export async function requireRequestCoder(event:H3Event):Promise<VerifiedMember> {
 const actor:VerifiedMember = await requireRequestMember(event);
 if (!actor.member.isNinja) throw createError({statusCode:403,statusMessage:"Coder access required"});
 if (!profileQuerySchema.safeParse(getQuery(event)).success) throw createError({statusCode:400,statusMessage:"Unexpected query fields"});
 setResponseHeader(event,"Cache-Control","private, no-store");
 return actor;
}
