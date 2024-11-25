import { MemberEntity } from "~~/server/db/entities";
import { NumberToDateOrNull } from "~~/shared/utils/DateHelpers";
import { Utf8Encode, Utf8EncodeOrNull } from "~~/shared/utils/StringHelpers";

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

export const FromLegacyMemberEntity = (
	legacy: LegacyMemberEntity,
): MemberEntity => {
	return {
		id: legacy.Id,
		deleted: legacy.Deleted,
		birthYear: legacy.BirthYear,
		email: null,
		fingerprintId: legacy.FingerprintId,
		gardaVetted: false,
		githubLogin: legacy.GithubLogin,
		goalLongTerm: legacy.GoalLongTerm,
		goalShortTerm: legacy.GoalShortTerm,
		isMentor: false,
		isNinja: true,
		isParent: false,
		loginDatePrevious: NumberToDateOrNull(legacy.LoginDatePrevious),
		loginDate: NumberToDateOrNull(legacy.LoginDate),
		login: Utf8EncodeOrNull(legacy.Login),
		nameFirst: Utf8Encode(legacy.FirstName),
		nameLast: Utf8Encode(legacy.LastName),
		passwordHash: EncodePasswordHash(legacy.PasswordHash),
		phone: null,
		registeredCurrentTerm: legacy.RegisteredCurrentTerm,
		scratchName: legacy.ScratchName,
		teamId: legacy.TeamId,
		xboxGamertag: legacy.XboxGamertag,
	};
};

export const FromLegacyMemberEntities = (
	legacies: LegacyMemberEntity[],
): MemberEntity[] => {
	return legacies.map(FromLegacyMemberEntity);
};
