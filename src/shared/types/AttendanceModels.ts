import { z } from "zod";

// Added MILESTONE to support milestone attendance notifications
export const MemberAttendanceNotificationTypesSchema = z.enum([
	"GREETING",
	"BADGE_EARNED",
	"BELT_EARNED",
	"REMINDER",
	"MILESTONE",
]);
export type MemberAttendanceNotificationTypes = z.infer<
	typeof MemberAttendanceNotificationTypesSchema
>;

export const AttendanceNotificationSchema = z.strictObject({
	type: MemberAttendanceNotificationTypesSchema,
	message: z.string(),
	dateString: DateStringSchema.optional(),
});
export const AttendanceNotificationArraySchema = z.array(
	AttendanceNotificationSchema,
);

export type AttendanceNotification = z.infer<
	typeof AttendanceNotificationSchema
>;
export type AttendanceNotificationArray = z.infer<
	typeof AttendanceNotificationArraySchema
>;

/**
 * Schema for Response from the sign-in API
 * Must contain at least the values expeced by the fingerprint scanner
 */
export const AttendanceSignInResponseModelSchema = z.object({
	// Required for fingerprint scanner integration
	memberId: z.string(),
	memberName: z.string(),
	memberSessionCount: z.number().min(1),
	memberMessage: z.string(),

	// Used by web ui, but not fingerprint scanner
	logs: z.array(z.string()),
	memberDetails: MemberModelSchema,
	notifications: AttendanceNotificationArraySchema,
	previousSignInDate: DateStringSchema.optional(),
});

/**
 * Response from the sign-in API
 * Failure is indicated by HTTP status code 400, not this type
 */
export type AttendanceSignInResponseModel = z.infer<
	typeof AttendanceSignInResponseModelSchema
>;
