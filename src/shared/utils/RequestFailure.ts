import { z } from "zod";
import { validationFieldErrors, validationFieldErrorsSchema, type ValidationFieldError } from "./ValidationErrors";

const FAILURE_SCHEMA: z.ZodObject<{ data: z.ZodObject<{ statusMessage: z.ZodString }> }> = z.object({ data: z.object({ statusMessage: z.string() }) });
const VALIDATION_FAILURE_SCHEMA: z.ZodType<{ data: { data: { validationErrors: ValidationFieldError[] } } }> = z.object({ data: z.object({ data: z.object({ validationErrors: validationFieldErrorsSchema }) }) });
const LEGACY_VALIDATION_SCHEMA: z.ZodType<{ validationErrors: ValidationFieldError[] }> = z.object({ validationErrors: validationFieldErrorsSchema });

/** Read local or server validation issues and align update paths with form field names. */
export function requestFailureFields(failure: unknown): ValidationFieldError[] {
	const parsed: ReturnType<typeof VALIDATION_FAILURE_SCHEMA.safeParse> = VALIDATION_FAILURE_SCHEMA.safeParse(failure);
	const legacy: ReturnType<typeof LEGACY_VALIDATION_SCHEMA.safeParse> = LEGACY_VALIDATION_SCHEMA.safeParse(failure);
	const errors: ValidationFieldError[] = failure instanceof z.ZodError ? validationFieldErrors(failure) : parsed.success ? parsed.data.data.data.validationErrors : legacy.success ? legacy.data.validationErrors : [];
	return errors.map((error: ValidationFieldError): ValidationFieldError => ({ ...error, name: error.name.replace(/^fields\./, "") }));
}

/** Extract a validated server message without displaying request URLs in the UI. */
export function requestFailureMessage(failure: unknown): string | null {
	const errors: ValidationFieldError[] = requestFailureFields(failure);
	if (errors.length) return errors.map((error: ValidationFieldError): string => {
		const label: string = error.name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\./g, " ").toLowerCase();
		return label ? `${label.charAt(0).toUpperCase()}${label.slice(1)}: ${error.message}` : error.message;
	}).join("; ").slice(0, 4000);
	const parsed: ReturnType<typeof FAILURE_SCHEMA.safeParse> = FAILURE_SCHEMA.safeParse(failure);
	return parsed.success ? parsed.data.data.statusMessage : null;
}
