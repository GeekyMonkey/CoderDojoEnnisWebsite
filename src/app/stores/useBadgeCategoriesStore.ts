import baseDbTableStore from "./baseDbTableStore";

/**
 * Auto-updating store of BadgeCategories data
 */
export function useBadgeCategoriesStore() {
	const badgeCategoriesStore = baseDbTableStore<BadgeCategoryModel>({
		apiPath: "badgeCategories",
		tableName: "badgeCategories",
		getLabel: (badgeCategory: BadgeCategoryModel) => {
			return badgeCategory.categoryName;
		},
	});

	const BadgeCategoriesById = computed<Record<string, BadgeCategoryModel>>(
		() => {
			const byId: Record<string, BadgeCategoryModel> = {};
			badgeCategoriesStore.Items.value?.forEach((badgeCategory) => {
				byId[badgeCategory.id] = badgeCategory;
			});
			return byId;
		},
	);

	return {
		...badgeCategoriesStore,
		BadgeCategories: badgeCategoriesStore.Items,
		BadgeCategoriesById,
	};
}
