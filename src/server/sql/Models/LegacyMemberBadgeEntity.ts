import { type MemberBadgeModel } from "~~/shared/types/models/MemberBadgeModel";
import { NumberToDateOrNull } from "~~/shared/utils/DateHelpers";
import { Utf8EncodeOrNull } from "~~/shared/utils/StringHelpers";

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
): MemberBadgeModel => {
	const application = NumberToDateOrNull(legacy.ApplicationDate);
	const awarded = NumberToDateOrNull(legacy.Awarded);
	const rejected = NumberToDateOrNull(legacy.RejectedDate);
	const goal = NumberToDateOrNull(legacy.GoalDate);
	return {
		id: legacy.Id,
		memberId: legacy.MemberId,
		badgeId: legacy.BadgeId,
		awardedByAdultId: legacy.AwardedByAdultId,
		applicationNotes: Utf8EncodeOrNull(legacy.ApplicationNotes),
		awardedNotes: Utf8EncodeOrNull(legacy.AwardedNotes),
		rejectedNotes: Utf8EncodeOrNull(legacy.RejectedNotes),
		rejectedByAdultId: legacy.RejectedByAdultId,
		applicationDate: application ? application.getTime() : null,
		awarded: awarded ? awarded.getTime() : null,
		rejectedDate: rejected ? rejected.getTime() : null,
		goalDate: goal ? goal.getTime() : null,
	};
};

export const FromLegacyMemberBadgeEntities = (
	legacies: LegacyMemberBadgeEntity[],
): MemberBadgeModel[] => {
	return legacies.map(FromLegacyMemberBadgeEntity);
};
