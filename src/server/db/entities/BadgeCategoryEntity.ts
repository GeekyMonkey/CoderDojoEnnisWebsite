import { BadgeCategoryModel } from "~~/shared/types/BadgeCategoryModel";
import { badgeCategories } from "../schema/schemas";

export type BadgeCategoryEntity = typeof badgeCategories.$inferSelect;

export const ToBadgeCategoryModel = (
	entity: BadgeCategoryEntity,
): BadgeCategoryModel => {
	return {
		...entity,
	};
};
