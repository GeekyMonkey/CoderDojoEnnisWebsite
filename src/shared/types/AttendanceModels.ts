import { z, type ZodType } from "zod";

/**
 * Schema for Response from the sign-in API
 */
export const AttendanceSignInResponseModelSchema = z.object({
	memberId: z.string(),
	memberName: z.string(),
	memberSessionCount: z.number(),
	memberMessage: z.string(),
	memberDetails: MemberModelSchema
}).strict();

/**
 * Response from the sign-in API
 * Failure is indicated by HTTP status code 400, not this type
 */
export type AttendanceSignInResponseModel = z.infer<typeof AttendanceSignInResponseModelSchema>;
