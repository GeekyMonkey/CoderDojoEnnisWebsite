<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 import type { AchievementReview } from "#shared/types/AchievementReview";
 import { useAchievementReviewsStore } from "~/stores/useAchievementReviewsStore";
 import BeltColor from "~/components/Belts/BeltColor.vue";
 import ApplicationFeedback from "./ApplicationFeedback.vue";
 const props = defineProps<{ memberId: string }>();
 const { t } = useI18n();
 const belts: ReturnType<typeof useAchievementReviewsStore> = useAchievementReviewsStore("belt", (): string => props.memberId);
 const badges: ReturnType<typeof useAchievementReviewsStore> = useAchievementReviewsStore("badge", (): string => props.memberId);
 const earnedIds: ComputedRef<Set<string>> = computed((): Set<string> => new Set((belts.data.value ?? []).filter((review: AchievementReview): boolean => review.awarded !== null).map((review: AchievementReview): string => review.definitionId)));
 const nextBelt: ComputedRef<AchievementReview | null> = computed((): AchievementReview | null => [...(belts.data.value ?? [])].filter((review: AchievementReview): boolean => !review.definitionDeleted && !earnedIds.value.has(review.definitionId)).sort((a: AchievementReview, b: AchievementReview): number => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))[0] ?? null);
 const nextApplications: ComputedRef<AchievementReview[]> = computed((): AchievementReview[] => (belts.data.value ?? []).filter((review: AchievementReview): boolean => review.definitionId === nextBelt.value?.definitionId && review.applicationDate !== null && review.awarded === null).sort((a: AchievementReview, b: AchievementReview): number => (b.applicationDate ?? 0) - (a.applicationDate ?? 0)));
 const badgeGoals: ComputedRef<AchievementReview[]> = computed((): AchievementReview[] => {
  const rows: AchievementReview[] = badges.data.value ?? [];
  const earned: Set<string> = new Set(rows.filter((review: AchievementReview): boolean => review.awarded !== null).map((review: AchievementReview): string => review.definitionId));
  const goals: Map<string, AchievementReview> = new Map();
  for (const review of rows) if (review.goalDate !== null && !earned.has(review.definitionId)) goals.set(review.definitionId, review);
  return [...goals.values()].sort((a: AchievementReview, b: AchievementReview): number => (a.categoryName ?? "").localeCompare(b.categoryName ?? "") || a.label.localeCompare(b.label));
 });
 const applicationsByDefinition: ComputedRef<Record<string, AchievementReview[]>> = computed((): Record<string, AchievementReview[]> => {
  const result: Record<string, AchievementReview[]> = {};
  for (const review of badges.data.value ?? []) if (review.applicationDate !== null && !review.awarded && !review.rejectedDate) (result[review.definitionId] ??= []).push(review);
  return result;
 });
</script>
<template>
 <div class="MemberProgress">
  <section><h3>{{ t('achievementReviews.nextBelt') }}</h3><p v-if="belts.isPending.value">{{ t('profile.loading') }}</p><UAlert v-else-if="belts.isError.value" color="error" :title="t('achievementReviews.loadError')" /><template v-else-if="nextBelt"><BeltColor :belt="nextBelt.belt" size="md" /><p class="Description">{{ nextBelt.description }}</p><ApplicationFeedback v-for="review in nextApplications" :key="review.id" :review="review" /></template><p v-else>{{ t('achievementReviews.noNextBelt') }}</p></section>
  <section><h3>{{ t('achievementReviews.badgeGoals') }}</h3><p v-if="badges.isPending.value">{{ t('profile.loading') }}</p><UAlert v-else-if="badges.isError.value" color="error" :title="t('achievementReviews.loadError')" /><template v-else><p v-if="!badgeGoals.length">{{ t('achievementReviews.goalsEmpty') }}</p><article v-for="goal in badgeGoals" :key="goal.definitionId"><h4>★ {{ goal.categoryName ?? t('definitionMaintenance.unavailableCategory') }} — {{ goal.label }}</h4><p class="Description">{{ goal.description }}</p><ApplicationFeedback v-for="review in applicationsByDefinition[goal.definitionId] ?? []" :key="review.id" :review="review" /></article></template></section>
 </div>
</template>
<style scoped lang="scss">
 .MemberProgress, section, article { display: grid; gap: calc(var(--spacing) * 3); min-width: 0; } .MemberProgress { gap: calc(var(--spacing) * 6); } h3,h4 { font-weight: 600; } .Description { white-space: pre-wrap; overflow-wrap: anywhere; } article { padding: calc(var(--spacing) * 3); border: 1px solid var(--ui-border); border-radius: var(--ui-radius); }
</style>
