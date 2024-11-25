import { MemberEntity } from "~~/server/db/entities";
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

export const FromLegacyAdultEntity = (
	legacy: LegacyAdultEntity,
): MemberEntity => {
	return {
		id: legacy.Id,
		deleted: legacy.Deleted,
		birthYear: null,
		email: legacy.Email,
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
		passwordHash: EncodePasswordHash(legacy.PasswordHash),
		phone: legacy.Phone,
		registeredCurrentTerm: false,
		scratchName: legacy.ScratchName,
		teamId: null,
		xboxGamertag: legacy.XboxGamertag,
	};
};

export const FromLegacyAdultEntities = (
	legacies: LegacyAdultEntity[],
): MemberEntity[] => {
	return legacies.map(FromLegacyAdultEntity);
};
