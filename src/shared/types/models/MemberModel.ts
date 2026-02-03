import { z } from "zod";
import { Base64Encode } from "#shared/utils/StringHelpers";
import type { Database } from "../../../types/supabase";

export type MemberRecord = Database["coderdojo"]["Tables"]["members"]["Row"];

export const MemberModelSchema = z.strictObject({
	id: z.string(),
	deleted: z.boolean(),
	birthYear: z.number().nullable(),
	email: z.string().nullable(),
	fingerprintId: z.number().nullable(),
	nfcTag: z.string().nullable(),
	gardaVetted: z.boolean(),
	githubLogin: z.string().nullable(),
	goalLongTerm: z.string().nullable(),
	goalShortTerm: z.string().nullable(),
	hasAvatar: z.boolean(),
	hasPhoto: z.boolean(),
	isMentor: z.boolean(),
	isNinja: z.boolean(),
	isParent: z.boolean(),
	login: z.string().nullable(),
	loginDate: z.number().nullable(),
	loginDatePrevious: z.number().nullable(),
	nameFirst: z.string().nullable(),
	nameLast: z.string().nullable(),
	phone: z.string().nullable(),
	registeredCurrentTerm: z.boolean(),
	scratchName: z.string().nullable(),
	teamId: z.string().nullable(),
	xboxGamertag: z.string().nullable(),
});
export const MemberModelArraySchema = z.array(MemberModelSchema);

export type MemberModel = z.infer<typeof MemberModelSchema>;
export type MemberModelArray = z.infer<typeof MemberModelArraySchema>;

export type MemberSupabaseModel = { memberId: string } & Pick<
	MemberModel,
	"isMentor" | "isNinja" | "isParent" | "nameFirst" | "nameLast"
>;

/**
 * Adjust the member login date and previous login date
 */
export const Member_SetLoginDate = (member: MemberModel): MemberModel => {
	member.loginDatePrevious = member.loginDate;
	member.loginDate = Date.now();
	return member;
};

/**
 * Base64 encode the password hash for storage in Supabase
 */
export const EncodePasswordHash = (
	passwordHash: string | null,
): string | null => {
	if (passwordHash === null) {
		return null;
	}
	try {
		const encoded: string = Base64Encode(passwordHash);
		return encoded;
	} catch (err) {
		throw new Error(`Error encoding password hash for ${passwordHash}: ${err}`);
	}
};

export function memberFromRecord(record: MemberRecord): MemberModel {
	return MemberModelSchema.parse({
		id: record.id,
		deleted: record.deleted,
		birthYear: record.birth_year,
		email: record.email,
		fingerprintId: record.fingerprint_id,
		nfcTag: record.nfc_tag,
		gardaVetted: record.garda_vetted,
		githubLogin: record.github_login,
		goalLongTerm: record.goal_long_term,
		goalShortTerm: record.goal_short_term,
		hasAvatar: record.has_avatar,
		hasPhoto: record.has_photo,
		isMentor: record.is_mentor,
		isNinja: record.is_ninja,
		isParent: record.is_parent,
		login: record.login,
		loginDate: record.login_date ? Date.parse(record.login_date) : null,
		loginDatePrevious: record.login_date_previous
			? Date.parse(record.login_date_previous)
			: null,
		nameFirst: record.name_first,
		nameLast: record.name_last,
		phone: record.phone,
		registeredCurrentTerm: record.registered_current_term,
		scratchName: record.scratch_name,
		teamId: record.team_id,
		xboxGamertag: record.xbox_gamertag,
	});
}

export function memberToRecord(model: MemberModel): MemberRecord {
	return {
		id: model.id,
		deleted: model.deleted,
		birth_year: model.birthYear,
		email: model.email,
		fingerprint_id: model.fingerprintId,
		nfc_tag: model.nfcTag,
		garda_vetted: model.gardaVetted,
		github_login: model.githubLogin,
		goal_long_term: model.goalLongTerm,
		goal_short_term: model.goalShortTerm,
		has_avatar: model.hasAvatar,
		has_photo: model.hasPhoto,
		is_mentor: model.isMentor,
		is_ninja: model.isNinja,
		is_parent: model.isParent,
		login: model.login,
		login_date: model.loginDate
			? new Date(model.loginDate).toISOString()
			: null,
		login_date_previous: model.loginDatePrevious
			? new Date(model.loginDatePrevious).toISOString()
			: null,
		name_first: model.nameFirst,
		name_last: model.nameLast,
		phone: model.phone,
		registered_current_term: model.registeredCurrentTerm,
		scratch_name: model.scratchName,
		team_id: model.teamId,
		xbox_gamertag: model.xboxGamertag,
	} as MemberRecord;
}

export function memberFromRecords(records: MemberRecord[]): MemberModel[] {
	return records.map(memberFromRecord);
}

export function memberToRecords(models: MemberModel[]): MemberRecord[] {
	return models.map(memberToRecord);
}
