import { z } from "zod";
import { MAX_SOURCE_BYTES } from "./ProfileImages";
/** Validate picker and drop files before allocating image decoding resources. */
export const imageSourceSchema: z.ZodType<File> = z.custom<File>((value: unknown): value is File => typeof File !== "undefined" && value instanceof File).refine((file: File): boolean => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size > 0 && file.size <= MAX_SOURCE_BYTES);
export type EntityImageAction = { action: "upload"; expectedRevision: string | null; png: string } | { action: "delete"; expectedRevision: string | null };
export const entityImageActionSchema: z.ZodType<EntityImageAction> = z.discriminatedUnion("action", [
 z.strictObject({ action: z.literal("upload"), expectedRevision: z.uuid().nullable(), png: z.string().max(4_000_000).regex(/^[A-Za-z0-9+/]+={0,2}$/) }),
 z.strictObject({ action: z.literal("delete"), expectedRevision: z.uuid().nullable() }),
]);
