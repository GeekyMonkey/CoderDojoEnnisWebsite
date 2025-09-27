import { z } from "zod";
import type { Database } from "../../../types/supabase";

export type BadgeCategoryRecord = Database["coderdojo"]["Tables"]["badge_categories"]["Row"];

export const BadgeCategoryModelSchema = z
	.object({
		id: z.string(),
		deleted: z.boolean(),
		categoryName: z.string().nullable(),
		categoryDescription: z.string().nullable(),
	})
	.strict();

export type BadgeCategoryModel = z.infer<typeof BadgeCategoryModelSchema>;

export function badgeCategoryFromRecord(record: BadgeCategoryRecord): BadgeCategoryModel {
	return BadgeCategoryModelSchema.parse({
		id: String(record.id),
		deleted: Boolean(record.deleted),
		categoryName: record.category_name ?? null,
		categoryDescription: record.category_description ?? null,
	});
}

export function badgeCategoryToRecord(model: BadgeCategoryModel): BadgeCategoryRecord {
	return {
		id: model.id,
		deleted: model.deleted,
		category_name: model.categoryName,
		category_description: model.categoryDescription,
	} as BadgeCategoryRecord;
}

export function badgeCategoryFromRecords(records: BadgeCategoryRecord[]): BadgeCategoryModel[] {
	return records.map(badgeCategoryFromRecord);
}

export function badgeCategoryToRecords(models: BadgeCategoryModel[]): BadgeCategoryRecord[] {
	return models.map(badgeCategoryToRecord);
}
