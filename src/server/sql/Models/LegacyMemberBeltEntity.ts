import { type MemberBeltModel } from "#shared/types/models/MemberBeltModel";
import { NumberToDateOrNull } from "#shared/utils/DateHelpers";
import { Utf8EncodeOrNull } from "#shared/utils/StringHelpers";

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
): MemberBeltModel => {
	const application = NumberToDateOrNull(legacy.ApplicationDate);
	const awarded = NumberToDateOrNull(legacy.Awarded);
	const rejected = NumberToDateOrNull(legacy.RejectedDate);
	return {
		id: legacy.Id,
		memberId: legacy.MemberId,
		beltId: legacy.BeltId,
		awardedByAdultId: legacy.AwardedByAdultId,
		applicationNotes: Utf8EncodeOrNull(legacy.ApplicationNotes),
		awardedNotes: Utf8EncodeOrNull(legacy.AwardedNotes),
		rejectedNotes: Utf8EncodeOrNull(legacy.RejectedNotes),
		rejectedByAdultId: legacy.RejectedByAdultId,
		applicationDate: application ? application.getTime() : null,
		awarded: awarded ? awarded.getTime() : null,
		rejectedDate: rejected ? rejected.getTime() : null,
	};
};

export const FromLegacyMemberBeltEntities = (
	legacies: LegacyMemberBeltEntity[],
): MemberBeltModel[] => {
	return legacies.map(FromLegacyMemberBeltEntity);
};
