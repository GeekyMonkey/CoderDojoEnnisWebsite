import type { AchievementDecision } from "../types/AchievementReview";

type AchievementState = { application_date: string | null; awarded: string | null; rejected_date: string | null; awarded_by_adult_id: string | null; awarded_notes: string | null; rejected_by_adult_id: string | null; rejected_notes: string | null };
export type DecisionFields = Pick<AchievementState, "awarded" | "awarded_by_adult_id" | "awarded_notes" | "rejected_date" | "rejected_by_adult_id" | "rejected_notes">;

/** Convert stored timestamps for client-side review. */
function timestamp(value: string | null): number | null {
	return value ? Date.parse(value) : null;
}

/** Build only the fields changed by a mentor decision. */
export function decisionFields(decision: AchievementDecision, mentorId: string, now: string): DecisionFields {
	const cleared: DecisionFields = { awarded: null, awarded_by_adult_id: null, awarded_notes: null, rejected_date: null, rejected_by_adult_id: null, rejected_notes: null };
	if (decision.action === "approve") return { ...cleared, awarded: now, awarded_by_adult_id: mentorId, awarded_notes: decision.notes };
	if (decision.action === "reject") return { ...cleared, rejected_date: now, rejected_by_adult_id: mentorId, rejected_notes: decision.notes };
	return cleared;
}

/** Check that the submitted decision matches the state originally displayed. */
export function canDecide(record: AchievementState, decision: AchievementDecision): boolean {
	if (!record.application_date) return false;
	if (timestamp(record.awarded) !== decision.expectedAwarded || timestamp(record.rejected_date) !== decision.expectedRejected) return false;
	return decision.action === "undo" ? Boolean(record.awarded || record.rejected_date) : !record.awarded && !record.rejected_date;
}

