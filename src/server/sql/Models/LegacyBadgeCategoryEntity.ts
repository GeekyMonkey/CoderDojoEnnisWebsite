import { BadgeCategoryEntity } from "~~/server/db/entities";

/**
 * SQL Server Badge Category Entity
 */
export type LegacyBadgeCategoryEntity = {
	Id: string;
	Deleted: boolean;
	CategoryName: string | null;
	CategoryDescription: string | null;
};

export const FromLegacyBadgeCategoryEntity = (
	legacy: LegacyBadgeCategoryEntity,
): BadgeCategoryEntity => {
	return {
		id: legacy.Id,
		deleted: legacy.Deleted,
		categoryName: legacy.CategoryName,
		categoryDescription: legacy.CategoryDescription,
	};
};

export const FromLegacyBadgeCategoryEntities = (
	legacies: LegacyBadgeCategoryEntity[],
): BadgeCategoryEntity[] => {
	return legacies.map(FromLegacyBadgeCategoryEntity);
};
