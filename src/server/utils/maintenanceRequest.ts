import { createError, getQuery, getRouterParam, readBody, type H3Event } from "h3";
import type { z } from "zod";
import { profileIdentitySchema, profileQuerySchema } from "#shared/types/MemberProfile";
import { requireRequestMentor } from "./requestMentor";
import type { VerifiedMember } from "./requestMember";

/** Verify a current mentor session and reject unexpected query fields. */
export async function maintenanceActor(event: H3Event): Promise<VerifiedMember> {
	const actor: VerifiedMember = await requireRequestMentor(event);
	if (!profileQuerySchema.safeParse(getQuery(event)).success) throw createError({ statusCode: 400, statusMessage: "Unexpected query fields" });
	return actor;
}

/** Validate a selected member identity before reading or writing data. */
export function maintenanceId(event: H3Event): string {
	const parsed: ReturnType<typeof profileIdentitySchema.safeParse> = profileIdentitySchema.safeParse(getRouterParam(event, "memberId"));
	if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "Invalid member ID" });
	return parsed.data;
}

/** Apply a strict shared contract to untrusted request bodies. */
export async function maintenanceBody<T>(event: H3Event, schema: z.ZodType<T>): Promise<T> {
	const parsed: z.ZodSafeParseResult<T> = schema.safeParse(await readBody<unknown>(event));
	if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "Invalid maintenance fields" });
	return parsed.data;
}
