/**
 * SQL Server Member-Belt Entity
 */
export type LegacyMemberBeltEntity = {
	Id: string;
	MemberId: string;
	BeltId: string;
	AwardedByAdultId: string | null;
	ApplicationNotes: string | null;
	AwardedNotes: string | null;
	RejectedByAdultId: string | null;
	RejectedNotes: string | null;
	ApplicationDate: number | null;
	Awarded: number | null;
	RejectedDate: number | null;
};

export const FromLegacyMemberBeltEntity = (
	legacy: LegacyMemberBeltEntity,
): MemberBeltEntity => {
	return {
		id: legacy.Id,
		member_id: legacy.MemberId,
		belt_id: legacy.BeltId,
		awarded_by_adult_id: legacy.AwardedByAdultId,
		application_notes: legacy.ApplicationNotes,
		awarded_notes: legacy.AwardedNotes,
		rejected_by_adult_id: legacy.RejectedByAdultId,
		rejected_notes: legacy.RejectedNotes,
		application_date: legacy.ApplicationDate,
		awarded: legacy.Awarded,
		rejected_date: legacy.RejectedDate,
	};
};

export const FromLegacyMemberBeltEntities = (
	legacies: LegacyMemberBeltEntity[],
): MemberBeltEntity[] => {
	return legacies.map(FromLegacyMemberBeltEntity);
};
