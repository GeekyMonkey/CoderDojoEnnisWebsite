import { z } from "zod";
import type { VexTaskRecord } from "../../../server/db/VexTasksData";

/**
 * Task statuses, in display order
 */
export const VEX_TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export const VexTaskStatusSchema = z.enum(VEX_TASK_STATUSES);
export type VexTaskStatus = z.infer<typeof VexTaskStatusSchema>;

/**
 * VEX Task Model Schema (includes owner member ids)
 */
export const VexTaskModelSchema = z.strictObject({
	id: z.string(),
	deleted: z.boolean(),
	sprintId: z.string(),
	title: z.string(),
	notes: z.string().nullable(),
	linkUrl: z.string().nullable(),
	status: VexTaskStatusSchema,
	ownerMemberIds: z.array(z.string()),
	createdByMemberId: z.string().nullable(),
	updatedByMemberId: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

/**
 * VEX Task Model
 */
export type VexTaskModel = z.infer<typeof VexTaskModelSchema>;

/**
 * Schema for creating/updating a task (id omitted to create)
 */
export const VexTaskSaveSchema = z.strictObject({
	id: z.string().optional(),
	sprintId: z.string().min(1),
	title: z.string().trim().min(1).max(200),
	notes: z.string().trim().max(8000).nullable(),
	linkUrl: z
		.string()
		.trim()
		.max(1000)
		.regex(/^https?:\/\//i, "link must start with http:// or https://")
		.nullable(),
	status: VexTaskStatusSchema,
	ownerMemberIds: z.array(z.string().min(1)).max(20),
});

/**
 * Task save payload
 */
export type VexTaskSaveModel = z.infer<typeof VexTaskSaveSchema>;

/**
 * Convert VexTaskRecord (plus owners) to VexTaskModel (validated)
 */
export function vexTaskFromRecord(
	record: VexTaskRecord,
	ownerMemberIds: string[],
): VexTaskModel {
	return VexTaskModelSchema.parse({
		id: String(record.id),
		deleted: Boolean(record.deleted),
		sprintId: String(record.sprint_id),
		title: record.title,
		notes: record.notes ?? null,
		linkUrl: record.link_url ?? null,
		status: record.status,
		ownerMemberIds,
		createdByMemberId: record.created_by_member_id ?? null,
		updatedByMemberId: record.updated_by_member_id ?? null,
		createdAt: record.created_at,
		updatedAt: record.updated_at,
	});
}
