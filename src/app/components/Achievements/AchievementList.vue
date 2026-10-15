<script setup lang="ts">
	import { computed, type ComputedRef } from "vue";
	import type { AchievementKind } from "#shared/types/AchievementReview";
	import type { AchievementCardData } from "~/composables/useAchievementPresentation";
	import AchievementCard from "./AchievementCard.vue";
	import CollapsibleSection from "~/components/Layout/CollapsibleSection.vue";
	const props = defineProps<{
		editableShowcase?: boolean;
		kind: AchievementKind;
		mode: "earned" | "available" | "all" | "goals";
		items: AchievementCardData[];
		nextBelt: string | null;
	}>();
	type CategoryGroup = { name: string; items: AchievementCardData[] };
	type Group = { key: string; items: AchievementCardData[] };
	const { t } = useI18n();
	const groups: ComputedRef<Group[]> = computed((): Group[] => {
		if (props.mode === "goals")
			return [
				{
					key: props.kind === "belt" ? "nextBelt" : "badgeGoals",
					items: props.items.filter((item: AchievementCardData): boolean =>
						props.kind === "belt"
							? item.review.definitionId === props.nextBelt
							: item.goalDate !== null,
					),
				},
			];
		const keys: string[] =
			props.mode === "earned"
				? ["pending", "awarded"]
				: props.mode === "available"
					? ["pending", "available"]
					: ["awarded", "pending", "available"];
		return keys.map((key: string): Group => ({
			key,
			items: props.items.filter((item: AchievementCardData): boolean =>
				key === "awarded"
					? item.earned
					: key === "pending"
						? item.pending
						: !item.earned && !item.pending && !item.review.definitionDeleted,
			),
		}));
	});
	const categories: ComputedRef<Record<string, CategoryGroup[]>> = computed(
		(): Record<string, CategoryGroup[]> =>
			Object.fromEntries(
				groups.value.map((group: Group): [string, CategoryGroup[]] => {
					const map: Map<string, AchievementCardData[]> = new Map();
					for (const item of group.items) {
						const name: string =
							props.kind === "badge"
								? (item.review.categoryName ??
									t("definitionMaintenance.unavailableCategory"))
								: "";
						const values: AchievementCardData[] = map.get(name) ?? [];
						values.push(item);
						map.set(name, values);
					}
					return [
						group.key,
						[...map.entries()].map(
							([name, values]: [
								string,
								AchievementCardData[],
							]): CategoryGroup => ({ name, items: values }),
						),
					];
				}),
			),
	);
</script>
<template>
	<section class="AchievementList">
		<section v-for="group in groups" :key="group.key" class="AchievementGroup">
			<h2>
				{{ t(`achievementReviews.${group.key}`) }} ({{ group.items.length }})
			</h2>
			<p v-if="!group.items.length">{{ t("achievementReviews.empty") }}</p>
			<CollapsibleSection
				v-for="category in categories[group.key] ?? []"
				:key="category.name"
				:title="
					kind === 'badge'
						? `${category.name} (${category.items.length})`
						: null
				"
				:open="group.key === 'pending' || mode === 'goals'"
				><AchievementCard
					v-for="item in category.items"
					:key="item.review.definitionId"
					:review="item.review"
					:editableShowcase="editableShowcase"
					:history="item.history"
					:goalDate="item.goalDate"
					:open="item.pending || mode === 'goals'"
					><slot :item="item" /></AchievementCard
			></CollapsibleSection>
		</section>
	</section>
</template>
<style scoped lang="scss">
	.AchievementList,
	.AchievementGroup {
		display: grid;
		gap: calc(var(--spacing) * 4);
		min-width: 0;
	}
	h2 {
		font-size: var(--text-lg);
		font-weight: 600;
	}
</style>
