import { createError, type H3Error } from "h3";
import type { z } from "zod";
import type { ApiResponse } from "#shared/types/ApiResponse";
import { validationFieldErrors, type ValidationFieldError } from "#shared/utils/ValidationErrors";

type ValidationFailureResponse = Extract<ApiResponse<never>, { success: false }>;

/** Build the legacy API failure envelope with consistent field details and logs. */
export function validationFailureResponse(error: z.ZodError, logs: string[] = []): ValidationFailureResponse {
	return {
		success: false,
		error: error.issues.map((issue: z.core.$ZodIssue): string => issue.message).join(", "),
		validationErrors: validationFieldErrors(error),
		logs: [...logs, "Validation error"],
	};
}

/** Return field-specific validation details through the standard HTTP error envelope. */
export function validationError(error: z.ZodError, statusMessage: string, field: string = ""): H3Error {
	return createError({ statusCode: 400, statusMessage, data: { validationErrors: validationFieldErrors(error).map((issue: ValidationFieldError): ValidationFieldError => ({ ...issue, name: issue.name || field })) } });
}

/** Validate request inputs without discarding field-level failure details. */
export function validateRequest<T>(schema: z.ZodType<T>, input: unknown, statusMessage: string, field: string = ""): T {
	const parsed: z.ZodSafeParseResult<T> = schema.safeParse(input);
	if (!parsed.success) throw validationError(parsed.error, statusMessage, field);
	return parsed.data;
}
