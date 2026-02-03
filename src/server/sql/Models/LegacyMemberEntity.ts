import { type MemberModel } from "#shared/types/models/MemberModel";
import { NumberToDateOrNull } from "#shared/utils/DateHelpers";
import { Utf8Encode, Utf8EncodeOrNull } from "#shared/utils/StringHelpers";

/**
 * SQL Server Member Entity
 */
export type LegacyMemberEntity = {
	Id: string;
	Deleted: boolean;
	BirthYear: number | null;
	FingerprintId: number | null;
	FirstName: string;
	GithubLogin: string | null;
	GoalLongTerm: string | null;
	GoalShortTerm: string | null;
	LastName: string;
	Login: string | null;
	LoginDate: number | null;
	LoginDatePrevious: number | null;
	PasswordHash: string | null;
	RegisteredCurrentTerm: boolean;
	ScratchName: string | null;
	TeamId: string | null;
	XboxGamertag: string | null;
};

/**
 * Convert LegacyMemberEntity to MemberModel
 */
export const FromLegacyMemberEntity = (
	legacy: LegacyMemberEntity,
): MemberModel => {
	const loginDatePrev = NumberToDateOrNull(legacy.LoginDatePrevious);
	const loginDate = NumberToDateOrNull(legacy.LoginDate);
	// Use raw millisecond values (no timezone/DST adjustment; verification layer handles tolerance)
	const adjPrev = loginDatePrev ? loginDatePrev.getTime() : null;
	const adjDate = loginDate ? loginDate.getTime() : null;
	const member: MemberModel = {
		id: legacy.Id,
		deleted: legacy.Deleted,
		birthYear: legacy.BirthYear,
		email: null,
		fingerprintId: legacy.FingerprintId,
		gardaVetted: false,
		githubLogin: legacy.GithubLogin,
		goalLongTerm: legacy.GoalLongTerm,
		goalShortTerm: legacy.GoalShortTerm,
		hasAvatar: false,
		hasPhoto: false,
		isMentor: false,
		isNinja: true,
		isParent: false,
		loginDatePrevious: adjPrev,
		loginDate: adjDate,
		login: Utf8EncodeOrNull(legacy.Login),
		nameFirst: Utf8Encode(legacy.FirstName),
		nameLast: Utf8Encode(legacy.LastName),
		phone: null,
		registeredCurrentTerm: legacy.RegisteredCurrentTerm,
		scratchName: legacy.ScratchName,
		teamId: legacy.TeamId,
		xboxGamertag: legacy.XboxGamertag,
	};
	return member;
};

/**
 * Convert array of LegacyMemberEntity to array of MemberModel
 */
export const FromLegacyMemberEntities = (
	legacies: LegacyMemberEntity[],
): MemberModel[] => {
	return legacies.map(FromLegacyMemberEntity);
};
