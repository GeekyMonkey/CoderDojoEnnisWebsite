import { z } from "zod";

/**
 * Belt Model Schema
 */
export const BeltModelSchema = z.object({
	id: z.string(),
	deleted: z.boolean(),
	color: z.string().nullable(),
	hexCode: z.string().nullable(),
	description: z.string().nullable(),
	sortOrder: z.number(),
});

/**
 * Belt Model
 */
export type BeltModel = z.infer<typeof BeltModelSchema>;
