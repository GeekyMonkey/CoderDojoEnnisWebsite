import { z } from "zod";
import type { VexResourceRecord } from "../../../server/db/VexResourcesData";

/**
 * Resource categories, in display order. Labels/intros live in i18n (vex.resources.categories)
 */
export const VEX_RESOURCE_CATEGORIES = [
	"competition",
	"vex-iq",
	"programming",
	"vexcode-vr",
	"design-building",
	"driving-strategy",
	"videos-references",
] as const;
export const VexResourceCategorySchema = z.enum(VEX_RESOURCE_CATEGORIES);
export type VexResourceCategory = z.infer<typeof VexResourceCategorySchema>;

/**
 * Resource types (drives the icon)
 */
export const VEX_RESOURCE_TYPES = [
	"website",
	"video",
	"document",
	"tool",
	"forum",
] as const;
export const VexResourceTypeSchema = z.enum(VEX_RESOURCE_TYPES);
export type VexResourceType = z.infer<typeof VexResourceTypeSchema>;

/**
 * VEX Resource Model Schema
 */
export const VexResourceModelSchema = z.strictObject({
	id: z.string(),
	deleted: z.boolean(),
	seasonId: z.string().nullable(),
	category: VexResourceCategorySchema,
	title: z.string(),
	description: z.string().nullable(),
	url: z.string(),
	resourceType: VexResourceTypeSchema,
	sortOrder: z.number(),
	isActive: z.boolean(),
});

/**
 * VEX Resource Model
 */
export type VexResourceModel = z.infer<typeof VexResourceModelSchema>;

/**
 * Schema for creating/updating a resource (id omitted to create)
 */
export const VexResourceSaveSchema = z.strictObject({
	id: z.string().optional(),
	seasonId: z.string().nullable(),
	category: VexResourceCategorySchema,
	title: z.string().trim().min(1).max(200),
	description: z.string().trim().max(1000).nullable(),
	url: z
		.string()
		.trim()
		.max(1000)
		.regex(/^https?:\/\//i, "url must start with http:// or https://"),
	resourceType: VexResourceTypeSchema,
	sortOrder: z.number().int(),
	isActive: z.boolean(),
});

/**
 * Resource save payload
 */
export type VexResourceSaveModel = z.infer<typeof VexResourceSaveSchema>;

/**
 * Convert VexResourceRecord to VexResourceModel (validated)
 */
export function vexResourceFromRecord(
	record: VexResourceRecord,
): VexResourceModel {
	const category = VexResourceCategorySchema.safeParse(record.category);
	const resourceType = VexResourceTypeSchema.safeParse(record.resource_type);
	return VexResourceModelSchema.parse({
		id: String(record.id),
		deleted: Boolean(record.deleted),
		seasonId: record.season_id ?? null,
		category: category.success ? category.data : "videos-references",
		title: record.title,
		description: record.description ?? null,
		url: record.url,
		resourceType: resourceType.success ? resourceType.data : "website",
		sortOrder: Number(record.sort_order),
		isActive: Boolean(record.is_active),
	});
}

/**
 * Convert array of VexResourceRecord to array of VexResourceModel
 */
export function vexResourceFromRecords(
	records: VexResourceRecord[],
): VexResourceModel[] {
	return records.map(vexResourceFromRecord);
}
