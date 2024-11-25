/**
 * Postgres Session Entity
 */
export type SessionEntity = {
	id: string;
	created_date: number;
	end_date: number | null;
	url: string | null;
	topic: string | null;
	adult_id: string | null;
	adult2_id: string | null;
	mentors_only: boolean;
};
