import { describe, expect, it } from "vitest";
import { AchievementDecisionSchema, type AchievementDecision } from "../types/AchievementReview";
import { canDecide, decisionFields } from "./AchievementDecisions";

const ID: string = "21630ded-fbf5-4ddc-9305-0db90c311ea8";
const NOW: string = "2026-10-10T12:00:00.000Z";
const DECISION: AchievementDecision = { kind: "badge", id: ID, action: "approve", notes: "Well done", expectedAwarded: null, expectedRejected: null };
const APPLICATION: Parameters<typeof canDecide>[0] = { application_date: NOW, awarded: null, awarded_by_adult_id: null, awarded_notes: null, rejected_date: null, rejected_by_adult_id: null, rejected_notes: null };

describe("achievement decisions", (): void => {
	it("requires non-empty notes and rejects supplied actor IDs", (): void => {
		expect(AchievementDecisionSchema.safeParse({ ...DECISION, notes: "   " }).success).toBe(false);
		expect(AchievementDecisionSchema.safeParse({ ...DECISION, mentorId: ID }).success).toBe(false);
		expect(AchievementDecisionSchema.safeParse({ ...DECISION, id: "invalid" }).success).toBe(false);
		expect(AchievementDecisionSchema.parse({ ...DECISION, notes: "  Good work  " }).notes).toBe("Good work");
	});
	it("requires a pending application and rejects stale decisions", (): void => {
		expect(canDecide(APPLICATION, DECISION)).toBe(true);
		expect(canDecide({ ...APPLICATION, application_date: null }, DECISION)).toBe(false);
		expect(canDecide({ ...APPLICATION, awarded: NOW }, DECISION)).toBe(false);
		expect(canDecide({ ...APPLICATION, rejected_date: NOW }, DECISION)).toBe(false);
		expect(canDecide(APPLICATION, { ...DECISION, action: "undo" })).toBe(false);
	});
	it("records the server actor and time for approval and rejection", (): void => {
		expect(decisionFields(DECISION, ID, NOW)).toMatchObject({ awarded: NOW, awarded_by_adult_id: ID, awarded_notes: "Well done", rejected_date: null });
		expect(decisionFields({ ...DECISION, action: "reject" }, ID, NOW)).toMatchObject({ awarded: null, rejected_date: NOW, rejected_by_adult_id: ID, rejected_notes: "Well done" });
	});
	it("undo clears decisions while preserving the original application", (): void => {
		const original: typeof APPLICATION & { application_notes: string } = { ...APPLICATION, awarded: NOW, awarded_by_adult_id: ID, awarded_notes: "Approved", application_notes: "My original evidence" };
		const undo: AchievementDecision = { ...DECISION, action: "undo", notes: "", expectedAwarded: Date.parse(NOW) };
		expect(canDecide(original, undo)).toBe(true);
		const restored: typeof original = { ...original, ...decisionFields(undo, ID, NOW) };
		expect(restored.application_date).toBe(NOW);
		expect(restored.application_notes).toBe("My original evidence");
		expect(restored.awarded).toBeNull();
		expect(restored.awarded_by_adult_id).toBeNull();
		expect(restored.awarded_notes).toBeNull();
		expect(canDecide(restored, undo)).toBe(false);
	});
});
