/**
 * Member-Belt Model
 */
export type MemberBeltModel = {
	id: string;
	memberId: string;
	beltId: string;
	awardedByAdultId: string | null;
	applicationNotes: string | null;
	awardedNotes: string | null;
	rejectedByAdultId: string | null;
	rejectedNotes: string | null;
	applicationDate: number | null;
	awarded: number | null;
	rejectedDate: number | null;
};
