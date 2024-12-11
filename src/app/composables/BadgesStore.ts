import { computed } from "vue";
import { CreateDbTableStore } from "../utils/CreateDbTableStore";
import { useBadgeCategoriesStore } from "./BadgeCategoriesStore";

/**
 * Auto-updating store of Badges data
 */
export function useBadgesStore() {
	const { BadgeCategories } = useBadgeCategoriesStore();

	const badgesStore = CreateDbTableStore<BadgeModel>({
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

	return {
		...badgesStore,
		Badges: badgesStore.Items,
		BadgeCategories: BadgeCategories,
		BadgesByCategory,
	};
}
