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
		birth_year: legacy.BirthYear,
		email: null,
		fingerprint_id: legacy.FingerprintId,
		garda_vetted: false,
		github_login: legacy.GithubLogin,
		goal_long_term: legacy.GoalLongTerm,
		goal_short_term: legacy.GoalShortTerm,
		is_mentor: false,
		is_ninja: true,
		is_parent: false,
		login_date_previous: legacy.LoginDatePrevious,
		login_date: legacy.LoginDate,
		login: legacy.Login,
		name_first: legacy.FirstName,
		name_last: legacy.LastName,
		password_hash: EncodePasswordHash(legacy.PasswordHash),
		phone: null,
		registered_current_term: legacy.RegisteredCurrentTerm,
		scratch_name: legacy.ScratchName,
		team_id: legacy.TeamId,
		xbox_gamertag: legacy.XboxGamertag,
	};
};

export const FromLegacyMemberEntities = (
	legacies: LegacyMemberEntity[],
): MemberEntity[] => {
	return legacies.map(FromLegacyMemberEntity);
};
