import { type BadgeCategoryModel } from "~~/shared/types/models/BadgeCategoryModel";

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
): BadgeCategoryModel => {
	return {
		id: legacy.Id,
		deleted: legacy.Deleted,
		categoryName: legacy.CategoryName,
		categoryDescription: legacy.CategoryDescription,
	};
};

export const FromLegacyBadgeCategoryEntities = (
	legacies: LegacyBadgeCategoryEntity[],
): BadgeCategoryModel[] => {
	return legacies.map(FromLegacyBadgeCategoryEntity);
};
