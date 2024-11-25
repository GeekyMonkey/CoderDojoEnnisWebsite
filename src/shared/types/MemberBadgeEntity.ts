/**
 * Postgres Member-Badge Entity
 */
export type MemberBadgeEntity = {
	id: string;
	member_id: string;
	badge_id: string;
	awarded_by_adult_id: string | null;
	application_notes: string | null;
	awarded_notes: string | null;
	rejected_by_adult_id: string | null;
	rejected_notes: string | null;
	application_date: number | null;
	awarded: number | null;
	rejected_date: number | null;
	goal_date: number | null;
};
