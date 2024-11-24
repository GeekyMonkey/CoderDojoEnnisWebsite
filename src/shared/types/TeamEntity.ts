/**
 * Postgres Team Entity
 */
export type TeamEntity = {
	id: string;
	deleted: boolean;
	goal: string | null;
	hexcode: string | null;
	notes: string | null;
	team_name: string;
};
