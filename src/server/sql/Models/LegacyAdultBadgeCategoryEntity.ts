import { MemberBadgeCategoryModel } from "~~/shared/types/models/MemberBadgeCategoryModel";

/**
 * SQL Server Adult-BadgeCategory Entity
 */
export type LegacyAdultBadgeCategoryEntity = {
	Id: string;
	MemberId: string;
	BadgeCategoryId: string;
};

export const FromLegacyAdultBadgeCategoryEntity = (
	legacy: LegacyAdultBadgeCategoryEntity,
): MemberBadgeCategoryModel => {
	return {
		id: legacy.Id,
		memberId: legacy.MemberId,
		badgeCategoryId: legacy.BadgeCategoryId,
	};
};

export const FromLegacyAdultBadgeCategoryEntities = (
	legacies: LegacyAdultBadgeCategoryEntity[],
): MemberBadgeCategoryModel[] => {
	return legacies.map(FromLegacyAdultBadgeCategoryEntity);
};
