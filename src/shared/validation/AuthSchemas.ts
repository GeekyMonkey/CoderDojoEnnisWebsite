import { z } from "zod";

const PASSWORD_LENGTH_MIN: number = 4;

/** Common username rule: allow email-style or names; trimmed, min 2 chars */
export const usernameSchema = z
	.string()
	.trim()
	.min(1, { error: "Username cannot be blank" })
	.min(4, { error: "Username too short" })
	.max(120, { error: "Username too long" });

export const passwordSchema = z
	.string()
	.trim()
	.min(1, { error: "Password cannot be blank" })
	.min(PASSWORD_LENGTH_MIN, { error: "Password too short" })
	.max(120, { error: "Password too long" });

export const loginRequestSchema = z.object({
	username: usernameSchema,
	password: passwordSchema,
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const passwordChangeRequestSchema = z
	.object({
		username: usernameSchema,
		oldPassword: passwordSchema,
		newPassword: passwordSchema.refine((p) => p.length >= PASSWORD_LENGTH_MIN, {
			error: `New password must be at least ${PASSWORD_LENGTH_MIN} characters`,
		}),
	})
	.refine((d) => d.oldPassword !== d.newPassword, {
        error: "New password must be different to old password"
    });
export type PasswordChangeRequest = z.infer<typeof passwordChangeRequestSchema>;
