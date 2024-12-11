import { z } from "zod";

/**
 * Badge Category Schema
 */
export const BadgeCategoryModelSchema = z.object({
	id: z.string(),
	deleted: z.boolean(),
	categoryName: z.string().nullable(),
	categoryDescription: z.string().nullable(),
});

/**
 * Badge Category Model
 */
export type BadgeCategoryModel = z.infer<typeof BadgeCategoryModelSchema>;
