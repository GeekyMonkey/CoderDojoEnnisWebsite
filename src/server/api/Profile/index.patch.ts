import { createError, defineEventHandler, getQuery, readBody, type H3Event } from "h3";
import { requireRequestMember } from "#server/utils/requestMember";
import { saveProfile } from "#server/db/ProfilesData";
import { memberProfileUpdateSchema, profileQuerySchema } from "#shared/types/MemberProfile";
import type { MemberModel } from "#shared/types/models/MemberModel";

/** Save the logged-in member's own editable profile fields. */
export default defineEventHandler(async (event: H3Event): Promise<MemberModel> => {
	const actor: Awaited<ReturnType<typeof requireRequestMember>> = await requireRequestMember(event);
	if (!profileQuerySchema.safeParse(getQuery(event)).success) throw createError({ statusCode: 400, statusMessage: "Unexpected profile query fields" });
	const parsed: ReturnType<typeof memberProfileUpdateSchema.safeParse> = memberProfileUpdateSchema.safeParse(await readBody<unknown>(event));
	if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "Invalid profile fields" });
	return saveProfile(actor, actor.id, parsed.data);
});
