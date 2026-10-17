import { isDeepStrictEqual } from "node:util";
import { createError } from "h3";
import type { VerifiedMember } from "./requestMember";
import type { MemberMerge } from "#shared/types/MemberMerge";
import type { ProfileImageSlot } from "#shared/types/ProfileImages";
import { FormatBucketFileName } from "#shared/types/Supabase";
import { memberFromRecord, type MemberModel, type MemberRecord } from "#shared/types/models/MemberModel";

type StoredMergeImage = { path: string; blob: Blob | null };
type ImageTransfer = { slot: ProfileImageSlot; source: StoredMergeImage; before: StoredMergeImage[] };
/** Resolve both supported formats without changing the source account's files. */
function path(memberId: string, slot: ProfileImageSlot, extension: string): string {
 return `Members/${slot === "photo" ? "Photos" : "Avatars"}/${FormatBucketFileName("Member", memberId, extension)}`;
}
/** Compare reviewed account data while allowing routine login-date changes. */
function preview(member: MemberModel): object {
 const { loginDate, loginDatePrevious, ...fields } = member;
 return fields;
}
/** Copy independently selected images and restore destination files if the merge fails. */
export async function withMergedProfileImages<T>(actor: VerifiedMember, body: MemberMerge, commit: () => Promise<T>): Promise<T> {
 const slots: ProfileImageSlot[] = (["photo", "avatar"] as const).filter((slot: ProfileImageSlot): boolean => body.images[slot] === "duplicate");
 if (!slots.length) return commit();
 if (actor.id === body.expectedKeep.id || actor.id === body.duplicateId || !actor.member.isMentor) throw createError({ statusCode: 403, statusMessage: "Cannot merge this account" });
 // Check both snapshots before touching storage; the RPC checks them again under row locks.
 const { data, error } = await actor.client.schema("coderdojo").from("members").select("*").in("id", [body.expectedKeep.id, body.duplicateId]).eq("deleted", false);
 if (error) throw createError({ statusCode: 503, statusMessage: "Unable to review merge accounts" });
 for (const expected of [body.expectedKeep, body.expectedDuplicate]) {
  const record: MemberRecord | undefined = data?.find((row: MemberRecord): boolean => row.id === expected.id);
  if (!record || !isDeepStrictEqual(preview(memberFromRecord(record)), preview(expected))) throw createError({ statusCode: 409, statusMessage: "Accounts changed; review again" });
 }
 const bucket: ReturnType<typeof actor.client.storage.from> = actor.client.storage.from("coderdojo");
 /** Read an image or confirm its absence without masking storage failures. */
 async function read(imagePath: string): Promise<StoredMergeImage> {
  const result: Awaited<ReturnType<typeof bucket.download>> = await bucket.download(imagePath);
  if (result.error && !(String(result.error.statusCode) === "404" || (String(result.error.statusCode) === "400" && /not found|does not exist/i.test(result.error.message)))) throw createError({ statusCode: 503, statusMessage: "Unable to read merge images" });
  return { path: imagePath, blob: result.data };
 }
 const transfers: ImageTransfer[] = [];
 for (const slot of slots) {
  const sources: StoredMergeImage[] = await Promise.all([read(path(body.duplicateId, slot, "png")), read(path(body.duplicateId, slot, "jpg"))]);
  const source: StoredMergeImage | undefined = sources.find((image: StoredMergeImage): boolean => Boolean(image.blob));
  if (!source) throw createError({ statusCode: 409, statusMessage: "Selected image unavailable; review again" });
  const before: StoredMergeImage[] = await Promise.all([read(path(body.expectedKeep.id, slot, "png")), read(path(body.expectedKeep.id, slot, "jpg"))]);
  transfers.push({ slot, source, before });
 }
 const touched: StoredMergeImage[] = [];
 try {
  for (const transfer of transfers) {
   touched.push(...transfer.before);
   const extension: string = transfer.source.path.endsWith(".png") ? "png" : "jpg";
   const destination: string = path(body.expectedKeep.id, transfer.slot, extension);
   const uploaded: Awaited<ReturnType<typeof bucket.upload>> = await bucket.upload(destination, transfer.source.blob!, { upsert: true, contentType: extension === "png" ? "image/png" : "image/jpeg", cacheControl: "0" });
   if (uploaded.error) throw createError({ statusCode: 503, statusMessage: "Unable to copy merge image" });
   const removed: Awaited<ReturnType<typeof bucket.remove>> = await bucket.remove([path(body.expectedKeep.id, transfer.slot, extension === "png" ? "jpg" : "png")]);
   if (removed.error) throw createError({ statusCode: 503, statusMessage: "Unable to replace merge image" });
  }
  return await commit();
 } catch (failure: unknown) {
  const restored: PromiseSettledResult<void>[] = await Promise.allSettled(touched.map(async (image: StoredMergeImage): Promise<void> => {
   const result: { error: unknown } = image.blob ? await bucket.upload(image.path, image.blob, { upsert: true, contentType: image.blob.type, cacheControl: "0" }) : await bucket.remove([image.path]);
   if (result.error) throw result.error;
  }));
  if (restored.some((result: PromiseSettledResult<void>): boolean => result.status === "rejected")) throw createError({ statusCode: 503, statusMessage: "Merge image recovery failed; reload both accounts" });
  throw failure;
 }
}
