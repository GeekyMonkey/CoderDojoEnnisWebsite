/**
 * Postgres Member Entity
 */
export type MemberEntity = {
	id: string;
	deleted: boolean;
	birth_year: number | null;
	email: string | null;
	fingerprint_id: number | null;
	garda_vetted: boolean;
	github_login: string | null;
	goal_long_term: string | null;
	goal_short_term: string | null;
	is_mentor: boolean;
	is_ninja: boolean;
	is_parent: boolean;
	login: string | null;
	login_date: number | null;
	login_date_previous: number | null;
	name_first: string | null;
	name_last: string | null;
	password_hash: string | null;
	phone: string | null;
	registered_current_term: boolean;
	scratch_name: string | null;
	team_id: string | null;
	xbox_gamertag: string | null;
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
	return Buffer.from(passwordHash).toString("base64");
};
