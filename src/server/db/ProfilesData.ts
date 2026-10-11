import { createError } from "h3";
import type { VerifiedMember } from "#server/utils/requestMember";
import { memberFromRecord, type MemberModel, type MemberRecord } from "#shared/types/models/MemberModel";
import type { ProfileEditableFields, MemberProfileResponse, MemberProfileUpdate } from "#shared/types/MemberProfile";

const PROFILE_COLUMNS: Record<keyof ProfileEditableFields, string> = {
	login: "login", nameFirst: "name_first", nameLast: "name_last", email: "email", phone: "phone",
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
	const keys: (keyof ProfileEditableFields)[] = Object.keys(PROFILE_COLUMNS) as (keyof ProfileEditableFields)[];
	for (const key of keys) values[PROFILE_COLUMNS[key]] = update.fields[key];
	const expected: Record<string, string | null> = {};
 for (const key of keys) expected[PROFILE_COLUMNS[key]] = update.expected[key];
 const { data, error } = await actor.client.schema("coderdojo").rpc("save_profile", { p_actor: actor.id, p_id: memberId, p_fields: values, p_expected: expected });
 if (error) {
  const status: number = error.code === "23505" || error.code === "P0001" ? 409 : error.code === "42501" ? 403 : error.code === "P0002" ? 404 : error.code === "22023" ? 400 : 503;
  throw createError({ statusCode: status, statusMessage: status === 503 ? "Unable to save profile" : error.message });
 }
 if (!data) throw createError({ statusCode: 503, statusMessage: "Unable to save profile" });
 return memberFromRecord(data as MemberRecord);
}
