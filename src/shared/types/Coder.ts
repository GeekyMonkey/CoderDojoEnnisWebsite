import { z } from "zod";
import { MemberModelSchema } from "./models/MemberModel";
import { TeamModelSchema } from "./models/TeamModel";
import {
	AchievementKindSchema,
	AchievementReviewSchema,
} from "./AchievementReview";

export const publicMemberSchema = MemberModelSchema.pick({
	id: true,
	birthYear: true,
	nameFirst: true,
	nameLast: true,
	hasPhoto: true,
	hasAvatar: true,
	githubLogin: true,
	scratchName: true,
	xboxGamertag: true,
	isNinja: true,
	isMentor: true,
	isParent: true,
}).strip();
export type PublicMember = z.infer<typeof publicMemberSchema>;
export const publicAwardSchema = AchievementReviewSchema.pick({
	id: true,
	kind: true,
	label: true,
	categoryName: true,
	belt: true,
	description: true,
	awarded: true,
	definitionDeleted: true,
	sortOrder: true,
}).strip();
export type PublicAward = z.infer<typeof publicAwardSchema>;
export const coderContextSchema = z.strictObject({
	member: MemberModelSchema,
	team: TeamModelSchema.nullable(),
	roster: z.array(publicMemberSchema),
});
export type CoderContext = z.infer<typeof coderContextSchema>;
export const teamMemberProfileSchema = z.strictObject({
	member: publicMemberSchema,
	team: TeamModelSchema,
	roster: z.array(publicMemberSchema),
	awards: z.array(publicAwardSchema),
});
export type TeamMemberProfile = z.infer<typeof teamMemberProfileSchema>;

export const showcaseIdsSchema = z
	.array(z.uuid())
	.refine(
		(ids: string[]): boolean => new Set(ids).size === ids.length,
		"Choose each showcase item once",
	);
export const applicationEvidenceSchema = z.strictObject({
	notes: z.string().trim().min(5).max(4000),
	showcaseItemIds: showcaseIdsSchema.default([]),
});
export const applicationShowcaseSchema = z.strictObject({
	kind: AchievementKindSchema,
	id: z.uuid(),
	showcaseItemIds: showcaseIdsSchema,
	expectedShowcaseItemIds: showcaseIdsSchema,
});
export type ApplicationShowcase = z.infer<typeof applicationShowcaseSchema>;
export const coderApplicationSchema = applicationEvidenceSchema.extend({
	kind: AchievementKindSchema,
	definitionId: z.uuid(),
});
export type CoderApplication = z.infer<typeof coderApplicationSchema>;
export const badgeGoalChangeSchema = z.strictObject({
	definitionId: z.uuid(),
	selected: z.boolean(),
	expectedGoalDate: z.number().finite().nonnegative().nullable(),
});
export type BadgeGoalChange = z.infer<typeof badgeGoalChangeSchema>;
export const applicationResultSchema = z.strictObject({ id: z.uuid() });
export type ApplicationResult = z.infer<typeof applicationResultSchema>;
