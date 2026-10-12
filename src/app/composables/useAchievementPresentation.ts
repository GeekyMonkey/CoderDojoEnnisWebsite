import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue";
import type { AchievementKind, AchievementReview } from "#shared/types/AchievementReview";

export type AchievementCardData = { review: AchievementReview; history: AchievementReview[]; goalDate: number | null; earned: boolean; pending: boolean; canApply: boolean };
type AchievementPresentation = { items: ComputedRef<AchievementCardData[]>; nextBelt: ComputedRef<string | null>; currentBelt: ComputedRef<AchievementReview | null> };

/** Return the latest meaningful history date, including direct awards without applications. */
function historyDate(review: AchievementReview): number { return Math.max(review.awarded ?? 0, review.rejectedDate ?? 0, review.applicationDate ?? 0, review.goalDate ?? 0); }

/** Derive role-neutral achievement cards from a caller's validated, store-owned history. */
export function useAchievementPresentation(kind: AchievementKind, source: MaybeRefOrGetter<AchievementReview[] | null>): AchievementPresentation {
 const rows: ComputedRef<AchievementReview[]> = computed((): AchievementReview[] => toValue(source) ?? []);
 const nextBelt: ComputedRef<string | null> = computed((): string | null => kind !== "belt" ? null : [...rows.value]
  .filter((review: AchievementReview): boolean => !review.definitionDeleted && !rows.value.some((other: AchievementReview): boolean => other.definitionId === review.definitionId && other.awarded !== null))
  .sort((left: AchievementReview, right: AchievementReview): number => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label) || left.definitionId.localeCompare(right.definitionId))[0]?.definitionId ?? null);
 const currentBelt: ComputedRef<AchievementReview | null> = computed((): AchievementReview | null => kind !== "belt" ? null : [...rows.value]
  .filter((review: AchievementReview): boolean => review.awarded !== null)
  .sort((left: AchievementReview, right: AchievementReview): number => (right.awarded ?? 0) - (left.awarded ?? 0))[0] ?? null);
 const items: ComputedRef<AchievementCardData[]> = computed((): AchievementCardData[] => {
  const grouped: Map<string, AchievementReview[]> = new Map();
  for (const row of rows.value) { const values: AchievementReview[] = grouped.get(row.definitionId) ?? []; values.push(row); grouped.set(row.definitionId, values); }
  return [...grouped.values()].map((values: AchievementReview[]): AchievementCardData => {
   const earned: boolean = values.some((row: AchievementReview): boolean => row.awarded !== null);
   const pending: boolean = values.some((row: AchievementReview): boolean => row.applicationDate !== null && row.awarded === null && row.rejectedDate === null);
   const review: AchievementReview = values.find((row: AchievementReview): boolean => row.awarded !== null) ?? values.find((row: AchievementReview): boolean => row.applicationDate !== null && row.rejectedDate === null) ?? values[0]!;
   const goalDates: number[] = values.filter((row: AchievementReview): boolean => row.goalDate !== null && row.awarded === null).map((row: AchievementReview): number => row.goalDate!);
   return { review, history: values.filter((row: AchievementReview): boolean => row.applicationDate !== null || row.goalDate !== null || row.awarded !== null || row.rejectedDate !== null)
    .sort((left: AchievementReview, right: AchievementReview): number => historyDate(right) - historyDate(left)),
    goalDate: earned || !goalDates.length ? null : Math.max(...goalDates), earned, pending,
    canApply: !earned && !pending && !review.definitionDeleted && (kind === "badge" || review.definitionId === nextBelt.value),
   };
  }).sort((left: AchievementCardData, right: AchievementCardData): number => (left.review.categoryName ?? "").localeCompare(right.review.categoryName ?? "") || left.review.sortOrder - right.review.sortOrder || left.review.label.localeCompare(right.review.label));
 });
 return { items, nextBelt, currentBelt };
}
