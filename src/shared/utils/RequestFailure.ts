import { z } from "zod";

const FAILURE_SCHEMA: z.ZodObject<{ data: z.ZodObject<{ statusMessage: z.ZodString }> }> = z.object({ data: z.object({ statusMessage: z.string() }) });

/** Extract a validated server message without displaying request URLs in the UI. */
export function requestFailureMessage(failure: unknown): string | null {
	const parsed: ReturnType<typeof FAILURE_SCHEMA.safeParse> = FAILURE_SCHEMA.safeParse(failure);
	return parsed.success ? parsed.data.data.statusMessage : null;
}
