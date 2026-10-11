import { createError, defineEventHandler, getQuery, getRouterParam, readBody, type H3Event } from "h3";
import { requireRequestMember } from "#server/utils/requestMember";
import { saveProfile } from "#server/db/ProfilesData";
import { memberProfileUpdateSchema, profileIdentitySchema, profileQuerySchema } from "#shared/types/MemberProfile";
import type { MemberModel } from "#shared/types/models/MemberModel";

/** Save common fields of an explicitly selected, authorized profile. */
export default defineEventHandler(async (event: H3Event): Promise<MemberModel> => {
	const actor: Awaited<ReturnType<typeof requireRequestMember>> = await requireRequestMember(event);
	const identity: ReturnType<typeof profileIdentitySchema.safeParse> = profileIdentitySchema.safeParse(getRouterParam(event, "memberId"));
	const body: ReturnType<typeof memberProfileUpdateSchema.safeParse> = memberProfileUpdateSchema.safeParse(await readBody<unknown>(event));
	if (!identity.success || !body.success || !profileQuerySchema.safeParse(getQuery(event)).success) throw createError({ statusCode: 400, statusMessage: "Invalid profile fields" });
	return saveProfile(actor, identity.data, body.data);
});
