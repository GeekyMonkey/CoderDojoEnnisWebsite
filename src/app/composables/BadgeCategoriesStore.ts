import { CreateDbTableStore } from "../utils/CreateDbTableStore";

/**
 * Auto-updating store of BadgeCategories data
 */
export function useBadgeCategoriesStore() {
	const badgeCategoriesStore = CreateDbTableStore<BadgeCategoryModel>({
		tableName: "badgeCategories",
		getLabel: (badgeCategory: BadgeCategoryModel) => {
			return badgeCategory.categoryName;
		},
	});

	return {
		...badgeCategoriesStore,
		BadgeCategories: badgeCategoriesStore.Items,
	};
}
