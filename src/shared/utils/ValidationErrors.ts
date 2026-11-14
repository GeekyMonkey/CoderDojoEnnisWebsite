import { z } from "zod";

export type ValidationFieldError = { name: string; message: string };
export const validationFieldErrorsSchema: z.ZodType<ValidationFieldError[]> = z.array(z.object({ name: z.string(), message: z.string() }));

/** Keep field paths and reasons without serializing submitted values or Zod internals. */
export function validationFieldErrors(error: z.ZodError): ValidationFieldError[] {
	return error.issues.flatMap((issue: z.core.$ZodIssue): ValidationFieldError[] => issue.code === "unrecognized_keys"
		? issue.keys.map((key: string): ValidationFieldError => ({ name: [...issue.path, key].map(String).join("."), message: "Unexpected field" }))
		: [{ name: issue.path.map(String).join("."), message: issue.message }]);
}
