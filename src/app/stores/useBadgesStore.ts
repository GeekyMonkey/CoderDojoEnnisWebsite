import baseDbTableStore from "./baseDbTableStore";
import { useBadgeCategoriesStore } from "./useBadgeCategoriesStore";

/**
 * Auto-updating store of Badges data
 */
export function useBadgesStore() {
	const { BadgeCategories } = useBadgeCategoriesStore();

	const badgesStore = baseDbTableStore<BadgeModel>({
		tableName: "badges",
		getLabel: (badge: BadgeModel) => {
			return badge.description;
		},
	});

	/**
	 * Dictionary of badges by badge category id
	 */
	const BadgesByCategory = computed(() => {
		const badgesByCategory: Record<string, BadgeModel[]> = {};
		badgesStore.Items.value?.forEach((badge) => {
			if (!!badge.badgeCategoryId) {
				if (!badgesByCategory[badge.badgeCategoryId]) {
					badgesByCategory[badge.badgeCategoryId] = [];
				}
				badgesByCategory[badge.badgeCategoryId]!.push(badge);
			}
		});
		return badgesByCategory;
	});

	const BadgesById = computed<Record<string, BadgeModel>>(() => {
		const byId: Record<string, BadgeModel> = {};
		badgesStore.Items.value?.forEach((badge) => {
			byId[badge.id] = badge;
		});
		return byId;
	});

	return {
		...badgesStore,
		Badges: badgesStore.Items,
		BadgeCategories: BadgeCategories,
		BadgesByCategory,
		BadgesById,
	};
}
