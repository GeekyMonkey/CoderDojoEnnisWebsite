import { BadgeCategoryModel } from "~~/shared/types/models/BadgeCategoryModel";
import { badgeCategories } from "../schema/schemas";

export type BadgeCategoryEntity = typeof badgeCategories.$inferSelect;

/**
 * Convert a UI Model
 */
export const ToBadgeCategoryModel = (
	entity: BadgeCategoryEntity,
): BadgeCategoryModel => {
	return {
		...entity,
	};
};

/**
 * Convert to an array of UI Models
 */
export const ToBadgeCategoryModels = (
	entities: BadgeCategoryEntity[],
): BadgeCategoryModel[] => {
	return entities.map(ToBadgeCategoryModel);
};
