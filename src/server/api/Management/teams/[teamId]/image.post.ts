import { createError, defineEventHandler, getRouterParam, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { entityImageActionSchema, type EntityImageAction } from "#shared/types/ImageUpload";
import { teamIdSchema } from "#shared/types/TeamMaintenance";
import { teamFromRecord, type TeamModel } from "#shared/types/models/TeamModel";
import type { TeamRecord } from "#server/db/TeamsData";
import { validateProfilePng } from "#server/utils/profilePng";
import { FormatBucketFileName } from "#shared/types/Supabase";
/** Save a mentor's immutable team image only while the expected revision is current. */
export default defineEventHandler(async (event: H3Event): Promise<TeamModel> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const identity: ReturnType<typeof teamIdSchema.safeParse> = teamIdSchema.safeParse(getRouterParam(event, "teamId"));
 if (!identity.success) throw createError({ statusCode: 400, statusMessage: "Invalid team ID" });
 const id: string = identity.data;
 const action: EntityImageAction = await maintenanceBody(event, entityImageActionSchema);
 const db: ReturnType<typeof actor.client.schema> = actor.client.schema("coderdojo");
 const { data: before, error: readError } = await db.from("teams").select("*").eq("id", id).eq("deleted", false).maybeSingle();
 if (readError) throw createError({ statusCode: 503, statusMessage: "Unable to load team" });
 if (!before) throw createError({ statusCode: 404, statusMessage: "Team not found" });
 if ((before.image_revision ?? null) !== action.expectedRevision) throw createError({ statusCode: 409, statusMessage: "Team image changed; reload before saving" });
 const revision: string = crypto.randomUUID();
 const path: string = `Teams/${FormatBucketFileName("Team", id, "png").replace(".png", `_${revision}.png`)}`;
 const bucket: ReturnType<typeof actor.client.storage.from> = actor.client.storage.from("coderdojo");
 if (action.action === "upload") {
  const png: ReturnType<typeof validateProfilePng> = validateProfilePng(action.png);
  const { error } = await bucket.upload(path, png, { contentType: "image/png", upsert: false, cacheControl: "31536000" });
  if (error) throw createError({ statusCode: 503, statusMessage: "Unable to upload team image" });
 }
 const update: ReturnType<ReturnType<typeof db.from>["update"]> = db.from("teams").update({ has_image: action.action === "upload", image_revision: revision }).eq("id", id).eq("deleted", false);
 const guarded: typeof update = action.expectedRevision === null ? update.is("image_revision", null) : update.eq("image_revision", action.expectedRevision);
 const { data, error } = await guarded.select("*").maybeSingle();
 if (error || !data) {
  if (action.action === "upload") await bucket.remove([path]);
  throw createError({ statusCode: error ? 503 : 409, statusMessage: error ? "Unable to save team image" : "Team image changed; reload before saving" });
 }
 // Published metadata owns visibility; cleanup never rolls back a newer writer's image.
 const previous: string[] = before.image_revision ? [`Teams/${FormatBucketFileName("Team", id, "png").replace(".png", `_${before.image_revision}.png`)}`] : ["jpg", "png"].map((extension: string): string => `Teams/${FormatBucketFileName("Team", id, extension)}`);
 const cleanup: Awaited<ReturnType<typeof bucket.remove>> = await bucket.remove(previous);
 if (cleanup.error) console.warn("Unreferenced team image cleanup failed", { teamId: id });
 return teamFromRecord(data as TeamRecord);
});
