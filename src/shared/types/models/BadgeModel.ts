import { z } from "zod";
import type { Database } from "../../../types/supabase";

export type BadgeRecord = Database["coderdojo"]["Tables"]["badges"]["Row"];

export const BadgeModelSchema = z.strictObject({
	id: z.string(),
	deleted: z.boolean(),
	achievement: z.string().nullable(),
	badgeCategoryId: z.string().nullable(),
	description: z.string().nullable(),
});

export type BadgeModel = z.infer<typeof BadgeModelSchema>;

export function badgeFromRecord(record: BadgeRecord): BadgeModel {
	return BadgeModelSchema.parse({
		id: String(record.id),
		deleted: Boolean(record.deleted),
		achievement: record.achievement ?? null,
		badgeCategoryId: record.badge_category_id ?? null,
		description: record.description ?? null,
	});
}

export function badgeToRecord(model: BadgeModel): BadgeRecord {
	return {
		id: model.id,
		deleted: model.deleted,
		achievement: model.achievement,
		badge_category_id: model.badgeCategoryId,
		description: model.description,
	} as BadgeRecord;
}

export function badgeFromRecords(records: BadgeRecord[]): BadgeModel[] {
	return records.map(badgeFromRecord);
}

export function badgeToRecords(models: BadgeModel[]): BadgeRecord[] {
	return models.map(badgeToRecord);
}
