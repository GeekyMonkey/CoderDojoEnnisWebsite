import { MemberBadgeCategoryEntity } from "~~/server/db/entities";

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
		memberId: legacy.MemberId,
		badgeCategoryId: legacy.BadgeCategoryId,
	};
};

export const FromLegacyAdultBadgeCategoryEntities = (
	legacies: LegacyAdultBadgeCategoryEntity[],
): MemberBadgeCategoryEntity[] => {
	return legacies.map(FromLegacyAdultBadgeCategoryEntity);
};
