import { z } from "zod";

// Read the clock during validation because Workers initialize modules at epoch zero.
export const birthYearSchema: z.ZodType<number | null> = z.number().int().min(1900)
	.refine((value: number): boolean => value <= new Date().getUTCFullYear(), { message: "Birth year cannot be in the future" })
	.nullable();
