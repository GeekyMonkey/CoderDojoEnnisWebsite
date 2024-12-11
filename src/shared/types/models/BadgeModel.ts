import { z } from "zod";

/**
 * Badge Model Schema
 */
export const BadgeModelSchema = z.object({
	id: z.string(),
	deleted: z.boolean(),
	achievement: z.string().nullable(),
	badgeCategoryId: z.string().nullable(),
	description: z.string().nullable(),
});

/**
 * Badge Model
 */
export type BadgeModel = z.infer<typeof BadgeModelSchema>;
