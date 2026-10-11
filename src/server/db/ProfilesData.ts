import { createError } from "h3";
import type { VerifiedMember } from "#server/utils/requestMember";
import { memberFromRecord, type MemberModel, type MemberRecord } from "#shared/types/models/MemberModel";
import type { MemberProfileFields, MemberProfileResponse, MemberProfileUpdate } from "#shared/types/MemberProfile";

const PROFILE_COLUMNS: Record<keyof MemberProfileFields, string> = {
	nameFirst: "name_first", nameLast: "name_last", email: "email", phone: "phone",
	githubLogin: "github_login", scratchName: "scratch_name", xboxGamertag: "xbox_gamertag",
};

/** Restrict access to one's own profile or profiles managed by a mentor. */
export function requireProfileAccess(actor: VerifiedMember, memberId: string): void {
	if (actor.id !== memberId && !actor.member.isMentor) {
		throw createError({ statusCode: 403, statusMessage: "Profile access denied" });
	}
}

/** Read a profile with permissions derived from the actor and viewed member. */
export async function readProfile(actor: VerifiedMember, memberId: string): Promise<MemberProfileResponse> {
	requireProfileAccess(actor, memberId);
	const { data, error } = await actor.client.schema("coderdojo").from("members").select("*").eq("id", memberId).eq("deleted", false).maybeSingle();
	if (error) throw createError({ statusCode: 503, statusMessage: "Unable to load profile" });
	if (!data) throw createError({ statusCode: 404, statusMessage: "Profile not found" });
	return { member: memberFromRecord(data as MemberRecord), permissions: { editDetails: true, changePassword: actor.id === memberId } };
}

/** Apply only allowed fields with guarded comparison of the original snapshot. */
export async function saveProfile(actor: VerifiedMember, memberId: string, update: MemberProfileUpdate): Promise<MemberModel> {
	requireProfileAccess(actor, memberId);
	const values: Record<string, string | null> = {};
	const keys: (keyof MemberProfileFields)[] = Object.keys(PROFILE_COLUMNS) as (keyof MemberProfileFields)[];
	for (const key of keys) values[PROFILE_COLUMNS[key]] = update.fields[key];
	let query: ReturnType<ReturnType<ReturnType<typeof actor.client.schema>["from"]>["update"]> = actor.client.schema("coderdojo").from("members").update(values).eq("id", memberId).eq("deleted", false);
	for (const key of keys) {
		const value: string | null = update.expected[key];
		query = value === null ? query.is(PROFILE_COLUMNS[key], null) : query.eq(PROFILE_COLUMNS[key], value);
	}
	const { data, error } = await query.select("*").maybeSingle();
	if (error) throw createError({ statusCode: 503, statusMessage: "Unable to save profile" });
	if (!data) throw createError({ statusCode: 409, statusMessage: "Profile changed; reload before saving" });
	return memberFromRecord(data as MemberRecord);
}
