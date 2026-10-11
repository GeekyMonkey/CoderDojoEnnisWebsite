import { createError, type H3Event } from "h3";
import { requireRequestMember, type VerifiedMember } from "./requestMember";

/** Require current database mentor status in addition to the verified member session. */
export async function requireRequestMentor(event: H3Event): Promise<VerifiedMember> {
	const member: VerifiedMember = await requireRequestMember(event);
	if (!member.member.isMentor) throw createError({ statusCode: 403, statusMessage: "Mentor access required" });
	return member;
}
