import type { AchievementReview } from "../types/AchievementReview";

/** Select legacy welcome decisions since the previous login date. */
export function coderRecentDecisions(
 reviews: AchievementReview[], previousLogin: number | null, now: number = Date.now(),
): AchievementReview[] {
 const boundary: Date = new Date(previousLogin ?? now);
 boundary.setUTCHours(0, 0, 0, 0);
 const pendingBadges: Set<string> = new Set(reviews.filter((review: AchievementReview): boolean =>
  review.kind === "badge" && review.applicationDate !== null && review.awarded === null && review.rejectedDate === null,
 ).map((review: AchievementReview): string => review.definitionId));
 return reviews.filter((review: AchievementReview): boolean => {
  if (review.awarded !== null) return review.awarded >= boundary.getTime();
  return review.rejectedDate !== null && review.rejectedDate >= boundary.getTime()
   && (review.kind !== "badge" || !pendingBadges.has(review.definitionId));
 }).sort((left: AchievementReview, right: AchievementReview): number =>
  (right.awarded ?? right.rejectedDate ?? 0) - (left.awarded ?? left.rejectedDate ?? 0),
 );
}
