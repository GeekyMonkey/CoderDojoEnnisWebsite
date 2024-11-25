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
): MemberBadgeCategoryEntity => {
	return {
		id: legacy.Id,
		member_id: legacy.MemberId,
		badge_category_id: legacy.BadgeCategoryId,
	};
};

export const FromLegacyAdultBadgeCategoryEntities = (
	legacies: LegacyAdultBadgeCategoryEntity[],
): MemberBadgeCategoryEntity[] => {
	return legacies.map(FromLegacyAdultBadgeCategoryEntity);
};
