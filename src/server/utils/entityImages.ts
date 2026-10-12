import { createError } from "h3";
import type { VerifiedMember } from "./requestMember";
import type { TeamRecord } from "#server/db/TeamsData";
import type { BadgeCategoryRecord } from "#shared/types/models/BadgeCategoryModel";
import type { EntityImageAction } from "#shared/types/ImageUpload";
import { validateProfilePng } from "./profilePng";
import { FormatBucketFileName } from "#shared/types/Supabase";
type EntityImageKind = "team" | "category";
type EntityImageConfig = { table: "teams" | "badge_categories"; folder: string; prefix: string };
const ENTITY_IMAGES: Record<EntityImageKind, EntityImageConfig> = { team: { table: "teams", folder: "Teams", prefix: "Team" }, category: { table: "badge_categories", folder: "BadgeCategories", prefix: "BadgeCategory" } };
/** Publish an immutable entity image only while its expected revision is current. */
export async function changeEntityImage(actor: VerifiedMember, kind: EntityImageKind, id: string, action: EntityImageAction): Promise<TeamRecord | BadgeCategoryRecord> {
 const config: EntityImageConfig = ENTITY_IMAGES[kind];
 const db: ReturnType<typeof actor.client.schema> = actor.client.schema("coderdojo");
 const { data: before, error: readError } = await db.from(config.table).select("*").eq("id", id).eq("deleted", false).maybeSingle();
 if (readError) throw createError({ statusCode: 503, statusMessage: "Unable to load entity" });
 if (!before) throw createError({ statusCode: 404, statusMessage: "Image entity not found" });
 if ((before.image_revision ?? null) !== action.expectedRevision) throw createError({ statusCode: 409, statusMessage: "Image changed; reload before saving" });
 const revision: string = crypto.randomUUID();
 const path: string = `${config.folder}/${FormatBucketFileName(config.prefix, id, "png").replace(".png", `_${revision}.png`)}`;
 const bucket: ReturnType<typeof actor.client.storage.from> = actor.client.storage.from("coderdojo");
 if (action.action === "upload") {
  const png: ReturnType<typeof validateProfilePng> = validateProfilePng(action.png);
  const { error } = await bucket.upload(path, png, { contentType: "image/png", upsert: false, cacheControl: "31536000" });
  if (error) throw createError({ statusCode: 503, statusMessage: "Unable to upload entity image" });
 }
 const update: ReturnType<ReturnType<typeof db.from>["update"]> = db.from(config.table).update({ has_image: action.action === "upload", image_revision: revision }).eq("id", id).eq("deleted", false);
 const guarded: typeof update = action.expectedRevision === null ? update.is("image_revision", null) : update.eq("image_revision", action.expectedRevision);
 const { data, error } = await guarded.select("*").maybeSingle();
 if (error || !data) {
  if (action.action === "upload") await bucket.remove([path]);
  throw createError({ statusCode: error ? 503 : 409, statusMessage: error ? "Unable to save entity image" : "Image changed; reload before saving" });
 }
 // Published metadata owns visibility; cleanup never rolls back a newer writer's image.
 const previous: string[] = before.image_revision ? [`${config.folder}/${FormatBucketFileName(config.prefix, id, "png").replace(".png", `_${before.image_revision}.png`)}`] : ["jpg", "png"].map((extension: string): string => `${config.folder}/${FormatBucketFileName(config.prefix, id, extension)}`);
 const cleanup: Awaited<ReturnType<typeof bucket.remove>> = await bucket.remove(previous);
 if (cleanup.error) console.warn("Unreferenced entity image cleanup failed", { entity: kind, id });
 return data as TeamRecord | BadgeCategoryRecord;
}
