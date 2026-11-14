import { validateRequest, validationError } from "#server/utils/validationError";
import { defineEventHandler, getQuery, getRouterParam, setResponseHeader, type H3Event } from "h3";
import { requireRequestMember } from "#server/utils/requestMember";
import { readProfile } from "#server/db/ProfilesData";
import { profileIdentitySchema, profileQuerySchema, type MemberProfileResponse } from "#shared/types/MemberProfile";

/** Read a selected profile only when the actor is authorized to view it. */
export default defineEventHandler(async (event: H3Event): Promise<MemberProfileResponse> => {
	const actor: Awaited<ReturnType<typeof requireRequestMember>> = await requireRequestMember(event);
	const parsed: ReturnType<typeof profileIdentitySchema.safeParse> = profileIdentitySchema.safeParse(getRouterParam(event, "memberId"));
	if (!parsed.success) throw validationError(parsed.error, "Invalid profile identity", "memberId");
	validateRequest(profileQuerySchema, getQuery(event), "Invalid profile identity");
	setResponseHeader(event, "Cache-Control", "private, no-store");
	return readProfile(actor, parsed.data);
});
