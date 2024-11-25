/**
 * SQL Server Member-Badge Entity
 */
export type LegacyMemberBadgeEntity = {
	Id: string;
	MemberId: string;
	BadgeId: string;
	AwardedByAdultId: string | null;
	ApplicationNotes: string | null;
	AwardedNotes: string | null;
	RejectedByAdultId: string | null;
	RejectedNotes: string | null;
	ApplicationDate: number | null;
	Awarded: number | null;
	RejectedDate: number | null;
	GoalDate: number | null;
};

export const FromLegacyMemberBadgeEntity = (
	legacy: LegacyMemberBadgeEntity,
): MemberBadgeEntity => {
	return {
		id: legacy.Id,
		member_id: legacy.MemberId,
		badge_id: legacy.BadgeId,
		awarded_by_adult_id: legacy.AwardedByAdultId,
		application_notes: legacy.ApplicationNotes,
		awarded_notes: legacy.AwardedNotes,
		rejected_by_adult_id: legacy.RejectedByAdultId,
		rejected_notes: legacy.RejectedNotes,
		application_date: legacy.ApplicationDate,
		awarded: legacy.Awarded,
		rejected_date: legacy.RejectedDate,
		goal_date: legacy.GoalDate,
	};
};

export const FromLegacyMemberBadgeEntities = (
	legacies: LegacyMemberBadgeEntity[],
): MemberBadgeEntity[] => {
	return legacies.map(FromLegacyMemberBadgeEntity);
};
