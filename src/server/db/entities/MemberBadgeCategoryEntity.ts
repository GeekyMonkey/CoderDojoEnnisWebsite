import { MemberBadgeCategoryModel } from "~~/shared/types/models/MemberBadgeCategoryModel";
import { memberBadgeCategories } from "../schema/schemas";

export type MemberBadgeCategoryEntity =
	typeof memberBadgeCategories.$inferSelect;

/**
 * Convert a UI Model
 */
export const ToMemberBadgeCategoryModel = (
	entity: MemberBadgeCategoryEntity,
): MemberBadgeCategoryModel => {
	return {
		...entity,
	};
};

/**
 * Convert to an array of UI Models
 */
export const ToMemberBadgeCategoryModels = (
	entities: MemberBadgeCategoryEntity[],
): MemberBadgeCategoryModel[] => {
	return entities.map(ToMemberBadgeCategoryModel);
};
