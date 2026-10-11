import { createError, defineEventHandler, getQuery, setResponseHeader, type H3Event } from "h3";
import { requireRequestMember } from "#server/utils/requestMember";
import { readProfile } from "#server/db/ProfilesData";
import { profileQuerySchema, type MemberProfileResponse } from "#shared/types/MemberProfile";

/** Read the logged-in member's profile independently of role. */
export default defineEventHandler(async (event: H3Event): Promise<MemberProfileResponse> => {
	const actor: Awaited<ReturnType<typeof requireRequestMember>> = await requireRequestMember(event);
	if (!profileQuerySchema.safeParse(getQuery(event)).success) throw createError({ statusCode: 400, statusMessage: "Unexpected profile query fields" });
	setResponseHeader(event, "Cache-Control", "private, no-store");
	return readProfile(actor, actor.id);
});
