import { createError, defineEventHandler, getQuery, readBody, type H3Event } from "h3";
import { requireRequestMember } from "#server/utils/requestMember";
import { profilePasswordSchema, profileQuerySchema } from "#shared/types/MemberProfile";
import { GeneratePasswordHash } from "#server/utils/authUtils";

/** Change only the authenticated member's password after checking the current hash. */
export default defineEventHandler(async (event: H3Event): Promise<null> => {
	const { id, client } = await requireRequestMember(event);
	if (!profileQuerySchema.safeParse(getQuery(event)).success) {
		throw createError({ statusCode: 400, statusMessage: "Unexpected profile query fields" });
	}
	const parsed: ReturnType<typeof profilePasswordSchema.safeParse> = profilePasswordSchema.safeParse(await readBody<unknown>(event));
	if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "Invalid password fields" });
	const salt: string = useRuntimeConfig(event).private.auth.pass_salt;
	const currentHash: string | null = await GeneratePasswordHash(parsed.data.currentPassword, salt);
	const newHash: string | null = await GeneratePasswordHash(parsed.data.newPassword, salt);
	if (!currentHash || !newHash) throw createError({ statusCode: 503, statusMessage: "Unable to change password" });
	const { data, error } = await client.schema("coderdojo").from("members")
		.update({ password_hash: newHash }).eq("id", id).eq("password_hash", currentHash)
		.eq("deleted", false).select("id").maybeSingle();
	if (error) throw createError({ statusCode: 503, statusMessage: "Unable to change password" });
	if (!data) throw createError({ statusCode: 400, statusMessage: "Current password is incorrect" });
	return null;
});
