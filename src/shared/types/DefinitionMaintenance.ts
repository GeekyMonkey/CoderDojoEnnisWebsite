import { z } from "zod";
export const definitionKindSchema = z.enum(["belt", "badge", "category"]);
export type DefinitionKind = z.infer<typeof definitionKindSchema>;
export const definitionIdSchema = z.uuid();
export const definitionSearchSchema = z.string().trim().max(200);
export const definitionSnapshotSchema = z.strictObject({ name: z.string(), description: z.string().nullable(), hexCode: z.string().nullable(), sortOrder: z.number().nullable(), categoryId: z.string().nullable() });
export type DefinitionFields = z.infer<typeof definitionSnapshotSchema>;
export const definitionSchema = definitionSnapshotSchema.extend({ id: definitionIdSchema, kind: definitionKindSchema, deleted: z.boolean(), hasImage: z.boolean().default(false), imageRevision: z.uuid().nullable().default(null), awardedCount: z.number().int().nonnegative().default(0) });
export type Definition = z.infer<typeof definitionSchema>;
export const definitionListSchema = z.array(definitionSchema);
/** Normalize optional input text while preserving unavailable values as null. */
function optionalText(max: number): z.ZodType<string | null> { return z.string().trim().max(max).nullable().transform((value: string | null): string | null => value || null); }
const editableSchema = z.strictObject({ name: z.string().trim().min(1).max(150), description: optionalText(4000), hexCode: z.string().trim().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).nullable().or(z.literal("")).transform((value: string | null): string | null => value || null), sortOrder: z.number().int().min(0).max(10000).nullable(), categoryId: definitionIdSchema.nullable() });
/** Reject fields which do not belong to the selected definition kind. */
export function definitionFieldsSchema(kind: DefinitionKind): typeof editableSchema {
 return editableSchema.superRefine((fields: DefinitionFields, ctx: z.RefinementCtx): void => {
  if (kind === "belt" && fields.sortOrder === null) ctx.addIssue({ code: "custom", path: ["sortOrder"], message: "Sort order is required" });
  if (kind === "badge" && fields.categoryId === null) ctx.addIssue({ code: "custom", path: ["categoryId"], message: "Category is required" });
  if (kind !== "belt" && (fields.hexCode !== null || fields.sortOrder !== null)) ctx.addIssue({ code: "custom", message: "Belt fields are not available for this definition" });
  if (kind !== "badge" && fields.categoryId !== null) ctx.addIssue({ code: "custom", path: ["categoryId"], message: "Category selection is only available for badges" });
 });
}
/** Apply the definition-specific input contract to a guarded update. */
export function definitionUpdateSchema(kind: DefinitionKind): z.ZodType<DefinitionUpdate> { return z.strictObject({ fields: definitionFieldsSchema(kind), expected: definitionSnapshotSchema }); }
export const definitionDeleteSchema = z.strictObject({ expected: definitionSnapshotSchema });
export type DefinitionUpdate = { fields: DefinitionFields; expected: DefinitionFields };
export type DefinitionDelete = z.infer<typeof definitionDeleteSchema>;
/** Extract editable fields for optimistic snapshot checks. */
export function definitionSnapshot(value: Definition): DefinitionFields { return { name: value.name, description: value.description, hexCode: value.hexCode, sortOrder: value.sortOrder, categoryId: value.categoryId }; }
/** Start a kind-specific creation form. */
export function newDefinition(kind: DefinitionKind): Definition { return { id: "new", kind, deleted: false, hasImage: false, imageRevision: null, awardedCount: 0, name: "", description: null, hexCode: null, sortOrder: kind === "belt" ? 0 : null, categoryId: null }; }
export const DEFINITION_PATHS: Record<DefinitionKind, string> = { belt: "belts", badge: "badges", category: "badge-categories" };
