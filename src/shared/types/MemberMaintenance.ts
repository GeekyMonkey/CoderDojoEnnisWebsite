import { z } from "zod";
import { DateStringSchema } from "../utils/DateHelpers";
import { memberProfileFieldsSchema, type MemberProfileFields } from "./MemberProfile";
import { MemberModelSchema, type MemberModel } from "./models/MemberModel";
import { MemberParentModelSchema } from "./models/MemberParentModel";
import { MemberBadgeCategoryModelSchema } from "./models/MemberBadgeCategoryModel";
import { MemberAttendanceModelSchema } from "./models/MemberAttendanceModel";
import { TeamModelSchema, type TeamModel } from "./models/TeamModel";
import { BadgeCategoryModelSchema } from "./models/BadgeCategoryModel";

export type MemberRole = "coder" | "parent" | "mentor";
export type AccountFields = Pick<MemberModel, "birthYear" | "fingerprintId" | "nfcTag" | "login" | "teamId" | "registeredCurrentTerm" | "isNinja" | "isParent" | "isMentor" | "gardaVetted">;
export type GoalFields = Pick<MemberModel, "goalShortTerm" | "goalLongTerm">;
export type GuardedUpdate<T> = { fields: T; expected: T };
export type NewMember = { profile: MemberProfileFields; account: AccountFields; password: string | null; attendanceDate: string | null };
export type RelationshipInput = { memberId: string; parentId: string };
export type SkillInput = { memberId: string; badgeCategoryId: string };
export type PasswordReset = { newPassword: string; confirmation: string };
export type MaintenanceData = {
	members: MemberModel[];
	teams: TeamModel[];
	categories: z.infer<typeof BadgeCategoryModelSchema>[];
	relationships: z.infer<typeof MemberParentModelSchema>[];
	skills: z.infer<typeof MemberBadgeCategoryModelSchema>[];
};

/** Normalize optional input to null without accepting arbitrary object shapes. */
function nullableText(maximum: number): z.ZodType<string | null> {
	return z.string().trim().max(maximum).nullable().transform((value: string | null): string | null => value || null);
}

export const accountFieldsSchema: z.ZodType<AccountFields> = z.strictObject({
	birthYear: z.number().int().min(1900).max(new Date().getFullYear()).nullable(),
	fingerprintId: z.number().int().min(1).max(2147483647).nullable(),
	nfcTag: nullableText(100),
	login: nullableText(100).refine((value: string | null): boolean => value === null || /^[\p{L}\p{N}._-]+$/u.test(value)),
	teamId: z.uuid().nullable(), registeredCurrentTerm: z.boolean(),
	isNinja: z.boolean(), isParent: z.boolean(), isMentor: z.boolean(), gardaVetted: z.boolean(),
}).refine((value: AccountFields): boolean => value.isNinja || value.isParent || value.isMentor, { path: ["isNinja"], message: "Select at least one role" });
export const accountSnapshotSchema: z.ZodType<AccountFields> = z.strictObject({
	birthYear: z.number().nullable(), fingerprintId: z.number().nullable(), nfcTag: z.string().nullable(), login: z.string().nullable(),
	teamId: z.string().nullable(), registeredCurrentTerm: z.boolean(), isNinja: z.boolean(), isParent: z.boolean(), isMentor: z.boolean(), gardaVetted: z.boolean(),
});
export const accountUpdateSchema: z.ZodType<GuardedUpdate<AccountFields>> = z.strictObject({ fields: accountFieldsSchema, expected: accountSnapshotSchema });
export const goalFieldsSchema: z.ZodType<GoalFields> = z.strictObject({ goalShortTerm: nullableText(4000), goalLongTerm: nullableText(4000) });
export const goalUpdateSchema: z.ZodType<GuardedUpdate<GoalFields>> = z.strictObject({ fields: goalFieldsSchema, expected: z.strictObject({ goalShortTerm: z.string().nullable(), goalLongTerm: z.string().nullable() }) });
export const newMemberSchema: z.ZodType<NewMember> = z.strictObject({ profile: memberProfileFieldsSchema, account: accountFieldsSchema, password: z.string().trim().min(4).max(120).nullable(), attendanceDate: DateStringSchema.nullable().default(null) });
export const relationshipInputSchema: z.ZodType<RelationshipInput> = z.strictObject({ memberId: z.uuid(), parentId: z.uuid() }).refine((value: RelationshipInput): boolean => value.memberId !== value.parentId);
export const skillInputSchema: z.ZodType<SkillInput> = z.strictObject({ memberId: z.uuid(), badgeCategoryId: z.uuid() });
export const passwordResetSchema: z.ZodType<PasswordReset> = z.strictObject({ newPassword: z.string().trim().min(4).max(120), confirmation: z.string().trim().min(4).max(120) }).refine((value: PasswordReset): boolean => value.newPassword === value.confirmation, { path: ["confirmation"], message: "Passwords do not match" });
export const maintenanceDataSchema: z.ZodType<MaintenanceData> = z.strictObject({ members: z.array(MemberModelSchema), teams: z.array(TeamModelSchema), categories: z.array(BadgeCategoryModelSchema), relationships: z.array(MemberParentModelSchema), skills: z.array(MemberBadgeCategoryModelSchema) });
export const attendanceHistorySchema: z.ZodArray<typeof MemberAttendanceModelSchema> = z.array(MemberAttendanceModelSchema);

/** Capture only account fields for section-specific optimistic concurrency. */
export function accountSnapshot(member: MemberModel): AccountFields {
	return { birthYear: member.birthYear, fingerprintId: member.fingerprintId, nfcTag: member.nfcTag, login: member.login, teamId: member.teamId,
		registeredCurrentTerm: member.registeredCurrentTerm, isNinja: member.isNinja, isParent: member.isParent, isMentor: member.isMentor, gardaVetted: member.gardaVetted };
}

/** Capture goals without coupling their save to unrelated profile changes. */
export function goalSnapshot(member: MemberModel): GoalFields {
	return { goalShortTerm: member.goalShortTerm, goalLongTerm: member.goalLongTerm };
}

/** Set initial role defaults for directory signup. */
export function newAccount(role: MemberRole): AccountFields {
	return { birthYear: null, fingerprintId: null, nfcTag: null, login: null, teamId: null, registeredCurrentTerm: role === "coder", isNinja: role === "coder", isParent: role === "parent", isMentor: role === "mentor", gardaVetted: false };
}

export type NewMemberForm = { profile: MemberProfileFields; account: AccountFields; password: string; confirmation: string; attended: boolean };
export const newMemberFormSchema: z.ZodType<NewMemberForm> = z.strictObject({
 attended: z.boolean(), profile: memberProfileFieldsSchema, account: accountFieldsSchema, password: z.string().trim().max(120), confirmation: z.string().trim().max(120),
}).refine((value: NewMemberForm): boolean => value.password === "" || value.password.length >= 4, { path: ["password"], message: "Use at least four characters" })
 .refine((value: NewMemberForm): boolean => value.password === value.confirmation, { path: ["confirmation"], message: "Passwords do not match" });
export const memberSearchSchema: z.ZodString = z.string().trim().max(200);
export const directoryFilterSchema: z.ZodObject<{ search: z.ZodString; registeredOnly: z.ZodBoolean }> = z.strictObject({ search: memberSearchSchema, registeredOnly: z.boolean() });
