import { requireRequestMember, type VerifiedMember } from "#server/utils/requestMember";
import { memberIdentitySchema, type MemberIdentity } from "#shared/types/MemberIdentity";

/** Return current bound identity and roles for channel authorization and cache lifecycle. */
export default defineEventHandler(async (event): Promise<MemberIdentity> => {
 const actor: VerifiedMember = await requireRequestMember(event);
 return memberIdentitySchema.parse({ id: actor.id, isMentor: actor.member.isMentor, isParent: actor.member.isParent, isNinja: actor.member.isNinja });
});
