import { createError, getHeader, type H3Event } from "h3";
import { GetSupabaseAdminClient, GetSupabaseRequestClient, type SupabaseClientType } from "#server/db/DatabaseClient";
import { memberFromRecord, type MemberModel, type MemberRecord } from "#shared/types/models/MemberModel";

export type VerifiedMember = { id: string; client: SupabaseClientType; member: MemberModel; readClient: SupabaseClientType };

/** Verify session identity and an active member record without trusting editable metadata. */
export async function requireRequestMember(event: H3Event): Promise<VerifiedMember> {
	const authorization: string = getHeader(event, "authorization") ?? "";
	if (!authorization.startsWith("Bearer ")) throw createError({ statusCode: 401, statusMessage: "Authentication required" });
	const client: SupabaseClientType | null = await GetSupabaseAdminClient(event);
	if (!client) throw createError({ statusCode: 503, statusMessage: "Database unavailable" });
	const { data, error } = await client.auth.getUser(authorization.slice(7));
	if (error && (!error.status || error.status >= 500)) throw createError({ statusCode: 503, statusMessage: "Unable to verify session" });
	if (error || !data.user) throw createError({ statusCode: 401, statusMessage: "Invalid session" });
	const { data: id, error: bindingError } = await client.schema("coderdojo").rpc("resolve_member_identity", { p_auth_user: data.user.id });
 if (bindingError) throw createError({ statusCode: 503, statusMessage: "Unable to verify member identity" });
	if (!id) throw createError({ statusCode: 403, statusMessage: "Member access required" });
	const { data: member, error: memberError } = await client.schema("coderdojo").from("members").select("*").eq("id", id).maybeSingle();
	if (memberError) throw createError({ statusCode: 503, statusMessage: "Unable to verify member" });
	if (!member || member.deleted) throw createError({ statusCode: 403, statusMessage: "Member access required" });
	const model: MemberModel = memberFromRecord(member as MemberRecord);
 if (!model.isMentor) { model.fingerprintId = null; model.nfcTag = null; }
 return { id, client, readClient: GetSupabaseRequestClient(event), member: model };
}
