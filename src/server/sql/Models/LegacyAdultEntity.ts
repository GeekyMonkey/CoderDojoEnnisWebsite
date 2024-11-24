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
		birth_year: null,
		email: legacy.Email,
		fingerprint_id: legacy.FingerprintId,
		garda_vetted: legacy.GardaVetted,
		github_login: legacy.GithubLogin,
		goal_long_term: null,
		goal_short_term: null,
		is_mentor: legacy.IsMentor,
		is_ninja: false,
		is_parent: legacy.IsParent,
		login_date_previous: legacy.LoginDatePrevious,
		login_date: legacy.LoginDate,
		login: legacy.Login,
		name_first: legacy.FirstName,
		name_last: legacy.LastName,
		password_hash: EncodePasswordHash(legacy.PasswordHash),
		phone: legacy.Phone,
		registered_current_term: false,
		scratch_name: legacy.ScratchName,
		team_id: null,
		xbox_gamertag: legacy.XboxGamertag,
	};
};

export const FromLegacyAdultEntities = (
	legacies: LegacyAdultEntity[],
): MemberEntity[] => {
	return legacies.map(FromLegacyAdultEntity);
};
