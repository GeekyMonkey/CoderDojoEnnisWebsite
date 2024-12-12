import baseDbTableStore from "./baseDbTableStore";

/**
 * Auto-updating store of BadgeCategories data
 */
export function useBadgeCategoriesStore() {
	const badgeCategoriesStore = baseDbTableStore<BadgeCategoryModel>({
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
