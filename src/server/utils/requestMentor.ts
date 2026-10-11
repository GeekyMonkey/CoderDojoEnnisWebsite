import { createError, getHeader, type H3Event } from "h3";
import { mentorMemberId } from "#shared/utils/MentorIdentity";
import { GetSupabaseAdminClient, type SupabaseClientType } from "#server/db/DatabaseClient";

type VerifiedMentor = { id: string; client: SupabaseClientType };

/** Verify the bearer token and current mentor status before accessing achievements. */
export async function requireRequestMentor(event: H3Event): Promise<VerifiedMentor> {
	const authorization: string = getHeader(event, "authorization") ?? "";
	if (!authorization.startsWith("Bearer ")) {
		throw createError({ statusCode: 401, statusMessage: "Authentication required" });
	}
	const client: SupabaseClientType | null = await GetSupabaseAdminClient(event);
	if (!client) throw createError({ statusCode: 503, statusMessage: "Database unavailable" });
	const { data, error } = await client.auth.getUser(authorization.slice(7));
	if (error || !data.user) throw createError({ statusCode: 401, statusMessage: "Invalid session" });
	const id: string | null = mentorMemberId(data.user);
	if (!id) throw createError({ statusCode: 403, statusMessage: "Mentor access required" });
	const { data: member, error: memberError } = await client.schema("coderdojo").from("members")
		.select("id, is_mentor, deleted").eq("id", id).maybeSingle();
	if (memberError) throw createError({ statusCode: 503, statusMessage: "Unable to verify mentor" });
	if (!member || member.deleted || !member.is_mentor) {
		throw createError({ statusCode: 403, statusMessage: "Mentor access required" });
	}
	return { id: member.id, client };
}
