import type { MaybeRefOrGetter } from "vue";
import { useAchievementReviewsStore } from "./useAchievementReviewsStore";

/** Provide mentor badge review queries and decisions. */
export function useMemberBadgesStore(memberId?: MaybeRefOrGetter<string>): ReturnType<typeof useAchievementReviewsStore> {
	return useAchievementReviewsStore("badge", memberId);
}
