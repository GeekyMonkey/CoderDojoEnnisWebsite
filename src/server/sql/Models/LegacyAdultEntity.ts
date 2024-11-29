import { GeneratePasswordHash, MemberEntity } from "~~/server/db/entities";
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
): MemberEntity => {
	const member: MemberEntity = {
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
		loginDatePrevious: NumberToDateOrNull(legacy.LoginDatePrevious),
		loginDate: NumberToDateOrNull(legacy.LoginDate),
		login: Utf8EncodeOrNull(legacy.Login),
		nameFirst: Utf8Encode(legacy.FirstName),
		nameLast: Utf8Encode(legacy.LastName),
		passwordHash: null,
		phone: legacy.Phone,
		registeredCurrentTerm: false,
		scratchName: legacy.ScratchName,
		teamId: null,
		xboxGamertag: legacy.XboxGamertag,
	};

	const autoConvertPassword =
		member.isMentor &&
		member.deleted == false &&
		member.fingerprintId != null;
	if (autoConvertPassword) {
		const salt = process.env.PASSWORD_SALT || "_Salty!_";
		const password =
			(member.nameFirst || "").substring(0, 1) +
			member.nameLast +
			String(member.fingerprintId);
		member.passwordHash = GeneratePasswordHash(password, salt);
	}

	return member;
};

/**
 * Convert an array of legacy adult entity to a member entity
 */
export const FromLegacyAdultEntities = (
	legacies: LegacyAdultEntity[],
): MemberEntity[] => {
	return legacies.map(FromLegacyAdultEntity);
};
