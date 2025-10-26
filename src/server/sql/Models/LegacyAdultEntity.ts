import { type MemberModel } from "~~/shared/types/models/MemberModel";
import { GeneratePasswordHash } from "~~/server/utils/authUtils";
import { NumberToDateOrNull } from "~~/shared/utils/DateHelpers";
import { Utf8Encode, Utf8EncodeOrNull } from "~~/shared/utils/StringHelpers";

/**
 * SQL Server Adult Entity
 */
export type LegacyAdultEntity = {
	Id: string;
	Deleted: boolean;
	Email: string | null;
	FingerprintId: number | null;
	FirstName: string;
	GardaVetted: boolean;
	GithubLogin: string | null;
	IsMentor: boolean;
	IsParent: boolean;
	LastName: string;
	Login: string | null;
	LoginDate: number | null;
	LoginDatePrevious: number | null;
	PasswordHash: string | null;
	Phone: string | null;
	ScratchName: string | null;
	XboxGamertag: string | null;
};

/**
 * Convert a single legacy adult entity to a member entity
 */
export const FromLegacyAdultEntity = (
	legacy: LegacyAdultEntity,
): MemberModel => {
	const loginDatePrev = NumberToDateOrNull(legacy.LoginDatePrevious);
	const loginDate = NumberToDateOrNull(legacy.LoginDate);
	// Use raw millisecond values (no timezone/DST adjustment; verification layer handles tolerance)
	const adjPrev = loginDatePrev ? loginDatePrev.getTime() : null;
	const adjDate = loginDate ? loginDate.getTime() : null;
	const member: MemberModel = {
		id: legacy.Id,
		deleted: legacy.Deleted,
		birthYear: null,
		email: Utf8EncodeOrNull(legacy.Email),
		fingerprintId: legacy.FingerprintId,
		gardaVetted: legacy.GardaVetted,
		githubLogin: legacy.GithubLogin,
		goalLongTerm: null,
		goalShortTerm: null,
		isMentor: legacy.IsMentor,
		isNinja: false,
		isParent: legacy.IsParent,
		loginDatePrevious: adjPrev,
		loginDate: adjDate,
		login: Utf8EncodeOrNull(legacy.Login),
		nameFirst: Utf8Encode(legacy.FirstName),
		nameLast: Utf8Encode(legacy.LastName),
		phone: legacy.Phone,
		registeredCurrentTerm: false,
		scratchName: legacy.ScratchName,
		teamId: null,
		xboxGamertag: legacy.XboxGamertag,
	};

	// password hashing intentionally omitted (passwordHash not in MemberModel schema)

	return member;
};

/**
 * Convert an array of legacy adult entity to a member entity
 */
export const FromLegacyAdultEntities = (
	legacies: LegacyAdultEntity[],
): MemberModel[] => {
	return legacies.map(FromLegacyAdultEntity);
};
