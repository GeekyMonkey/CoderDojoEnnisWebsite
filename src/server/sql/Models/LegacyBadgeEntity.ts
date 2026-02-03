import { type BadgeModel } from "#shared/types/models/BadgeModel";

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
): BadgeModel => {
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
): BadgeModel[] => {
	return legacies.map(FromLegacyBadgeEntity);
};
