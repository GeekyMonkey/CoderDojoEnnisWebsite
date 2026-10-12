import { z } from "zod";
import { MemberModelSchema, type MemberModel } from "./models/MemberModel";

/** Normalize blank optional profile fields to null. */
function optionalText(maximum: number): z.ZodType<string | null> {
	return z.string().trim().max(maximum).nullable().transform((value: string | null): string | null => value || null);
}

type ProfileFieldsShape = {
	nameFirst: z.ZodString; nameLast: z.ZodString;
	email: z.ZodType<string | null>; phone: z.ZodType<string | null>;
	githubLogin: z.ZodType<string | null>; scratchName: z.ZodType<string | null>; xboxGamertag: z.ZodType<string | null>;
};
type SnapshotShape = { [Key in keyof ProfileFieldsShape | "login"]: z.ZodNullable<z.ZodString> };

export const memberProfileFieldsSchema: z.ZodObject<ProfileFieldsShape> = z.strictObject({
	nameFirst: z.string().trim().min(1).max(80),
	nameLast: z.string().trim().min(1).max(80),
	email: optionalText(254).refine((value: string | null): boolean => value === null || z.email().safeParse(value).success),
	phone: optionalText(40),
	githubLogin: optionalText(100),
	scratchName: optionalText(100),
	xboxGamertag: optionalText(100),
});
export type MemberProfileFields = z.infer<typeof memberProfileFieldsSchema>;
export const profileEditableFieldsSchema: z.ZodObject<ProfileFieldsShape & { login: z.ZodString }> = memberProfileFieldsSchema.extend({
 login: z.string().trim().min(1).max(100).regex(/^[\p{L}\p{N}._-]+$/u, "Use letters, digits, dots, underscores or hyphens"),
});
export type ProfileEditableFields = z.infer<typeof profileEditableFieldsSchema>;
export const memberProfileUpdateSchema: z.ZodObject<{ fields: typeof profileEditableFieldsSchema; expected: z.ZodObject<SnapshotShape> }> = z.strictObject({
	fields: profileEditableFieldsSchema,
	expected: z.strictObject({
        login: z.string().nullable(),
		nameFirst: z.string().nullable(), nameLast: z.string().nullable(),
		email: z.string().nullable(), phone: z.string().nullable(),
		githubLogin: z.string().nullable(), scratchName: z.string().nullable(), xboxGamertag: z.string().nullable(),
	}),
});
export type MemberProfileUpdate = z.infer<typeof memberProfileUpdateSchema>;
export type MemberProfileSnapshot = MemberProfileUpdate["expected"];
export const profilePasswordSchema: z.ZodObject<{ currentPassword: z.ZodString; newPassword: z.ZodString }> = z.strictObject({
	currentPassword: z.string().trim().min(4).max(120),
	newPassword: z.string().trim().min(4).max(120),
}).refine((value: { currentPassword: string; newPassword: string }): boolean => value.currentPassword !== value.newPassword, { path: ["newPassword"], message: "Choose a different password" });
export type ProfilePasswordChange = z.infer<typeof profilePasswordSchema>;

/** Select editable fields without including roles or authentication data. */
export function memberProfileSnapshot(member: MemberModel): MemberProfileSnapshot {
	return { login: member.login, nameFirst: member.nameFirst, nameLast: member.nameLast, email: member.email,
		phone: member.phone, githubLogin: member.githubLogin, scratchName: member.scratchName, xboxGamertag: member.xboxGamertag };
}

export const profileModeSchema: z.ZodEnum<{ view: "view"; edit: "edit" }> = z.enum(["view", "edit"]);
export type ProfileMode = z.infer<typeof profileModeSchema>;
export const profileQuerySchema: z.ZodObject<Record<never, never>> = z.strictObject({});
export const profilePasswordFormSchema: z.ZodObject<{ currentPassword: z.ZodString; newPassword: z.ZodString; confirmation: z.ZodString }> = profilePasswordSchema.safeExtend({
	confirmation: z.string().trim().min(4).max(120),
}).refine((value: { newPassword: string; confirmation: string }): boolean => value.newPassword === value.confirmation, {
	path: ["confirmation"], message: "Passwords do not match",
});
export type ProfilePasswordForm = z.infer<typeof profilePasswordFormSchema>;

export const profileIdentitySchema: z.ZodUUID = z.uuid();
export const memberProfileResponseSchema: z.ZodObject<{
	member: typeof MemberModelSchema;
	permissions: z.ZodObject<{ editDetails: z.ZodBoolean; changePassword: z.ZodBoolean }>;
}> = z.strictObject({
	member: MemberModelSchema,
	permissions: z.strictObject({ editDetails: z.boolean(), changePassword: z.boolean() }),
});
export type MemberProfileResponse = z.infer<typeof memberProfileResponseSchema>;

export const selectedPasswordResetSchema:z.ZodObject<{newPassword:z.ZodString}> = z.strictObject({ newPassword:z.string().trim().min(4).max(120) });
export type SelectedPasswordReset = z.infer<typeof selectedPasswordResetSchema>;
export const selectedPasswordResetFormSchema:z.ZodObject<{newPassword:z.ZodString;confirmation:z.ZodString}> = selectedPasswordResetSchema.extend({ confirmation:z.string().trim().min(4).max(120) }).refine((value:{newPassword:string;confirmation:string}):boolean=>value.newPassword===value.confirmation,{path:["confirmation"],message:"Passwords do not match"});
