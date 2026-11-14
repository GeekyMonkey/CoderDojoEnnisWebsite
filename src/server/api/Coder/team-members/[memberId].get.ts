import { validationError } from "#server/utils/validationError";
import { defineEventHandler, getRouterParam, type H3Event } from "h3";
import { requireRequestCoder } from "#server/utils/coderRequest";
import { profileIdentitySchema } from "#shared/types/MemberProfile";
import { readCoderTeamMember } from "#server/db/CoderData";
import type { TeamMemberProfile } from "#shared/types/Coder";
/** Read an authorized teammate's public profile and earned achievements. */
export default defineEventHandler(async(event:H3Event):Promise<TeamMemberProfile> => {
 const actor:Awaited<ReturnType<typeof requireRequestCoder>> = await requireRequestCoder(event);
 const id:ReturnType<typeof profileIdentitySchema.safeParse> = profileIdentitySchema.safeParse(getRouterParam(event,"memberId"));
 if (!id.success) throw validationError(id.error, "Invalid member ID", "memberId");
 return readCoderTeamMember(actor,id.data);
});
