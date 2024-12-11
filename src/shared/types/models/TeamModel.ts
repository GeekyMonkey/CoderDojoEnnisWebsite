import { z } from "zod";

/**
 * Team Model
 */
export const TeamModelSchema = z
	.object({
		id: z.string(),
		deleted: z.boolean(),
		goal: z.string().nullable(),
		hexcode: z.string().nullable(),
		notes: z.string().nullable(),
		teamName: z.string(),
	})
	.strict();

export type TeamModel = z.infer<typeof TeamModelSchema>;
