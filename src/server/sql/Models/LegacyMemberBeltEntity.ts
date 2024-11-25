import { MemberBeltEntity } from "~~/server/db/entities";
import { NumberToDateOrNull } from "~~/shared/utils/DateHelpers";
import { Utf8EncodeOrNull } from "~~/shared/utils/StringHelpers";

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
		memberId: legacy.MemberId,
		beltId: legacy.BeltId,
		awardedByAdultId: legacy.AwardedByAdultId,
		applicationNotes: Utf8EncodeOrNull(legacy.ApplicationNotes),
		awardedNotes: Utf8EncodeOrNull(legacy.AwardedNotes),
		rejectedNotes: Utf8EncodeOrNull(legacy.RejectedNotes),
		rejectedByAdultId: legacy.RejectedByAdultId,
		applicationDate: NumberToDateOrNull(legacy.ApplicationDate),
		awarded: NumberToDateOrNull(legacy.Awarded),
		rejectedDate: NumberToDateOrNull(legacy.RejectedDate),
	};
};

export const FromLegacyMemberBeltEntities = (
	legacies: LegacyMemberBeltEntity[],
): MemberBeltEntity[] => {
	return legacies.map(FromLegacyMemberBeltEntity);
};
