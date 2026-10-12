import { useAchievementReviewsStore } from "~/stores/useAchievementReviewsStore";
import type { AchievementKind, AchievementReview } from "#shared/types/AchievementReview";
import { useAchievementPresentation } from "./useAchievementPresentation";
export type { AchievementCardData as CoderAchievement } from "./useAchievementPresentation";

/** Connect the own-coder store to the shared achievement presentation model. */
export function useCoderAchievements(kind: AchievementKind): ReturnType<typeof useAchievementPresentation> & { store: ReturnType<typeof useAchievementReviewsStore> } {
 const store: ReturnType<typeof useAchievementReviewsStore> = useAchievementReviewsStore(kind, undefined, true);
 return { store, ...useAchievementPresentation(kind, (): AchievementReview[] | null => store.data.value ?? null) };
}
