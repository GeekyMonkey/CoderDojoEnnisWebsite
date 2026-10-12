import { z } from "zod";
import { BeltModelSchema, type BeltModel } from "./models/BeltModel";

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
	definitionId: string;
	definitionDeleted: boolean;
	goalDate: number | null;
	memberId: string;
	memberName: string;
	canReview?: boolean;
	kind: AchievementKind;
	categoryId: string | null;
	categoryName: string | null;
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

export const AchievementReviewSchema = z.strictObject({
 id: z.string().min(1), definitionId: z.uuid(), definitionDeleted: z.boolean(), goalDate: z.number().nullable(), memberId: z.string().min(1), memberName: z.string(), canReview: z.boolean().default(true), kind: AchievementKindSchema,
 categoryId: z.string().nullable(), categoryName: z.string().nullable(), label: z.string(), sortOrder: z.number(), belt: BeltModelSchema.nullable(), description: z.string(),
 applicationDate: z.number().nullable(), applicationNotes: z.string().nullable(), awarded: z.number().nullable(), awardedNotes: z.string().nullable(), awardedByAdultId: z.string().nullable(),
 rejectedDate: z.number().nullable(), rejectedNotes: z.string().nullable(), rejectedByAdultId: z.string().nullable(),
});
