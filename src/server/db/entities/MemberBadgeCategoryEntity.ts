import { MemberBadgeCategoryModel } from "~~/shared/types/MemberBadgeCategoryModel";
import { memberBadgeCategories } from "../schema/schemas";

export type MemberBadgeCategoryEntity =
	typeof memberBadgeCategories.$inferSelect;

export const ToMemberBadgeCategoryModel = (
	entity: MemberBadgeCategoryEntity,
): MemberBadgeCategoryModel => {
	return {
		...entity,
	};
};
