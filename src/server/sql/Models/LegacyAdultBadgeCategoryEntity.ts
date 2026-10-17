import { MemberBadgeCategoryModel } from "#shared/types/models/MemberBadgeCategoryModel";

/**
 * SQL Server Adult-BadgeCategory Entity
 */
export type LegacyAdultBadgeCategoryEntity = {
	Id: string;
	AdultId: string;
	BadgeCategoryId: string;
};

export const FromLegacyAdultBadgeCategoryEntity = (
	legacy: LegacyAdultBadgeCategoryEntity,
): MemberBadgeCategoryModel => {
	return {
		id: legacy.Id,
		memberId: legacy.AdultId,
		badgeCategoryId: legacy.BadgeCategoryId,
	};
};

export const FromLegacyAdultBadgeCategoryEntities = (
	legacies: LegacyAdultBadgeCategoryEntity[],
): MemberBadgeCategoryModel[] => {
	return legacies.map(FromLegacyAdultBadgeCategoryEntity);
};
