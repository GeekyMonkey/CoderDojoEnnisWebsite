import { z } from "zod";
import type { BeltModel } from "./models/BeltModel";

export const AchievementKindSchema = z.enum(["badge", "belt"]);
export type AchievementKind = z.infer<typeof AchievementKindSchema>;
export const AchievementDecisionSchema = z.strictObject({
	kind: AchievementKindSchema,
	id: z.uuid(),
	action: z.enum(["approve", "reject", "undo"]),
	notes: z.string().trim().max(4000).default(""),
	expectedAwarded: z.number().nullable(),
	expectedRejected: z.number().nullable(),
}).superRefine((value: AchievementDecision, context: z.RefinementCtx): void => {
	if (value.action !== "undo" && !value.notes) {
		context.addIssue({ code: "custom", path: ["notes"], message: "Decision notes are required" });
	}
});
export type AchievementDecision = {
	kind: AchievementKind;
	id: string;
	action: "approve" | "reject" | "undo";
	notes: string;
	expectedAwarded: number | null;
	expectedRejected: number | null;
};
export type AchievementReview = {
	id: string;
	memberId: string;
	memberName: string;
	kind: AchievementKind;
	label: string;
	sortOrder: number;
	belt: BeltModel | null;
	description: string;
	applicationDate: number | null;
	applicationNotes: string | null;
	awarded: number | null;
	awardedNotes: string | null;
	awardedByAdultId: string | null;
	rejectedDate: number | null;
	rejectedNotes: string | null;
	rejectedByAdultId: string | null;
};
