import { z } from "zod";
import { DateStringSchema } from "#shared/utils/DateHelpers";
import type { VexSeasonRecord } from "../../../server/db/VexSeasonsData";

/**
 * VEX Season Model Schema
 */
export const VexSeasonModelSchema = z.strictObject({
	id: z.string(),
	deleted: z.boolean(),
	slug: z.string(),
	seasonLabel: z.string(),
	programName: z.string(),
	competitionName: z.string(),
	description: z.string().nullable(),
	isCurrent: z.boolean(),
	startDate: z.string().nullable(),
	endDate: z.string().nullable(),
});

/**
 * VEX Season Model
 */
export type VexSeasonModel = z.infer<typeof VexSeasonModelSchema>;

/**
 * Schema for creating/updating a season (id omitted to create)
 */
export const VexSeasonSaveSchema = z.strictObject({
	id: z.string().optional(),
	slug: z
		.string()
		.trim()
		.min(1)
		.max(60)
		.regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, numbers, dashes"),
	seasonLabel: z.string().trim().min(1).max(40),
	programName: z.string().trim().min(1).max(120),
	competitionName: z.string().trim().min(1).max(120),
	description: z.string().trim().max(2000).nullable(),
	isCurrent: z.boolean(),
	startDate: DateStringSchema.nullable(),
	endDate: DateStringSchema.nullable(),
});

/**
 * Season save payload
 */
export type VexSeasonSaveModel = z.infer<typeof VexSeasonSaveSchema>;

/**
 * Convert VexSeasonRecord to VexSeasonModel (validated)
 */
export function vexSeasonFromRecord(record: VexSeasonRecord): VexSeasonModel {
	return VexSeasonModelSchema.parse({
		id: String(record.id),
		deleted: Boolean(record.deleted),
		slug: record.slug,
		seasonLabel: record.season_label,
		programName: record.program_name,
		competitionName: record.competition_name,
		description: record.description ?? null,
		isCurrent: Boolean(record.is_current),
		startDate: record.start_date ?? null,
		endDate: record.end_date ?? null,
	});
}

/**
 * Convert array of VexSeasonRecord to array of VexSeasonModel
 */
export function vexSeasonFromRecords(
	records: VexSeasonRecord[],
): VexSeasonModel[] {
	return records.map(vexSeasonFromRecord);
}
