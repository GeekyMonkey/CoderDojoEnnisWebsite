import { z } from "zod";
import { DateStringSchema } from "#shared/utils/DateHelpers";
import type { VexSprintRecord } from "../../../server/db/VexSprintsData";

/**
 * Sprint statuses, in display order
 */
export const VEX_SPRINT_STATUSES = ["planned", "current", "complete"] as const;
export const VexSprintStatusSchema = z.enum(VEX_SPRINT_STATUSES);
export type VexSprintStatus = z.infer<typeof VexSprintStatusSchema>;

/**
 * VEX Sprint Model Schema
 */
export const VexSprintModelSchema = z.strictObject({
	id: z.string(),
	deleted: z.boolean(),
	seasonId: z.string(),
	sprintNumber: z.number(),
	title: z.string().nullable(),
	objective: z.string().nullable(),
	mentorNotes: z.string().nullable(),
	startDate: z.string().nullable(),
	reviewDate: z.string().nullable(),
	status: VexSprintStatusSchema,
	createdByMemberId: z.string().nullable(),
});

/**
 * VEX Sprint Model
 */
export type VexSprintModel = z.infer<typeof VexSprintModelSchema>;

/**
 * Schema for creating/updating a sprint (id omitted to create)
 */
export const VexSprintSaveSchema = z.strictObject({
	id: z.string().optional(),
	seasonId: z.string().min(1),
	sprintNumber: z.number().int().min(1).max(999),
	title: z.string().trim().max(120).nullable(),
	objective: z.string().trim().max(4000).nullable(),
	mentorNotes: z.string().trim().max(4000).nullable(),
	startDate: DateStringSchema.nullable(),
	reviewDate: DateStringSchema.nullable(),
	status: VexSprintStatusSchema,
});

/**
 * Sprint save payload
 */
export type VexSprintSaveModel = z.infer<typeof VexSprintSaveSchema>;

/**
 * Convert VexSprintRecord to VexSprintModel (validated)
 */
export function vexSprintFromRecord(record: VexSprintRecord): VexSprintModel {
	return VexSprintModelSchema.parse({
		id: String(record.id),
		deleted: Boolean(record.deleted),
		seasonId: String(record.season_id),
		sprintNumber: Number(record.sprint_number),
		title: record.title ?? null,
		objective: record.objective ?? null,
		mentorNotes: record.mentor_notes ?? null,
		startDate: record.start_date ?? null,
		reviewDate: record.review_date ?? null,
		status: record.status,
		createdByMemberId: record.created_by_member_id ?? null,
	});
}

/**
 * Convert array of VexSprintRecord to array of VexSprintModel
 */
export function vexSprintFromRecords(
	records: VexSprintRecord[],
): VexSprintModel[] {
	return records.map(vexSprintFromRecord);
}
