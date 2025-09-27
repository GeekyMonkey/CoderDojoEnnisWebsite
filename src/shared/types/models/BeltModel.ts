import { z } from "zod";
import type { Database } from "../../../types/supabase";

export type BeltRecord = Database["coderdojo"]["Tables"]["belts"]["Row"];

export const BeltModelSchema = z
	.object({
		id: z.string(),
		deleted: z.boolean(),
		color: z.string().nullable(),
		hexCode: z.string().nullable(),
		description: z.string().nullable(),
		sortOrder: z.number(),
	})
	.strict();

export type BeltModel = z.infer<typeof BeltModelSchema>;

export function beltFromRecord(record: BeltRecord): BeltModel {
	return BeltModelSchema.parse({
		id: String(record.id),
		deleted: Boolean(record.deleted),
		color: record.color ?? null,
		hexCode: record.hex_code ?? null,
		description: record.description ?? null,
		sortOrder: record.sort_order,
	});
}

export function beltToRecord(model: BeltModel): BeltRecord {
	return {
		id: model.id,
		deleted: model.deleted,
		color: model.color,
		hex_code: model.hexCode,
		description: model.description,
		sort_order: model.sortOrder,
	} as BeltRecord;
}

export function beltFromRecords(records: BeltRecord[]): BeltModel[] {
	return records.map(beltFromRecord);
}

export function beltToRecords(models: BeltModel[]): BeltRecord[] {
	return models.map(beltToRecord);
}
