import { BadgeEntity } from "~~/server/db/entities";

/**
 * SQL Server Badge Entity
 */
export type LegacyBadgeEntity = {
	Id: string;
	Deleted: boolean;
	Achievement: string;
	BadgeCategoryId: string | null;
	Description: string | null;
};

export const FromLegacyBadgeEntity = (
	legacy: LegacyBadgeEntity,
): BadgeEntity => {
	return {
		id: legacy.Id,
		deleted: legacy.Deleted,
		achievement: legacy.Achievement,
		badgeCategoryId: legacy.BadgeCategoryId,
		description: legacy.Description,
	};
};

export const FromLegacyBadgeEntities = (
	legacies: LegacyBadgeEntity[],
): BadgeEntity[] => {
	return legacies.map(FromLegacyBadgeEntity);
};
