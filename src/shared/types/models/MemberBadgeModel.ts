/**
 * Member-Badge Model
 */
export type MemberBadgeModel = {
	id: string;
	memberId: string;
	badgeId: string;
	awardedByAdultId: string | null;
	applicationNotes: string | null;
	awardedNotes: string | null;
	rejectedByAdultId: string | null;
	rejectedNotes: string | null;
	applicationDate: number | null;
	awarded: number | null;
	rejectedDate: number | null;
	goalDate: number | null;
};
