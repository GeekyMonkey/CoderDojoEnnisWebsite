import { MemberBadgeEntity } from "~~/server/db/entities";
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
): MemberBadgeEntity => {
	return {
		id: legacy.Id,
		memberId: legacy.MemberId,
		badgeId: legacy.BadgeId,
		awardedByAdultId: legacy.AwardedByAdultId,
		applicationNotes: Utf8EncodeOrNull(legacy.ApplicationNotes),
		awardedNotes: Utf8EncodeOrNull(legacy.AwardedNotes),
		rejectedNotes: Utf8EncodeOrNull(legacy.RejectedNotes),
		rejectedByAdultId: legacy.RejectedByAdultId,
		applicationDate: NumberToDateOrNull(legacy.ApplicationDate),
		awarded: NumberToDateOrNull(legacy.Awarded),
		rejectedDate: NumberToDateOrNull(legacy.RejectedDate),
		goalDate: NumberToDateOrNull(legacy.GoalDate),
	};
};

export const FromLegacyMemberBadgeEntities = (
	legacies: LegacyMemberBadgeEntity[],
): MemberBadgeEntity[] => {
	return legacies.map(FromLegacyMemberBadgeEntity);
};
