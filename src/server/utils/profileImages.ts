import { Buffer } from "node:buffer";
import { validateProfilePng } from "./profilePng";
import { createError, getQuery, getRouterParam, readBody, type H3Event } from "h3";
import { requireRequestMember, type VerifiedMember } from "#server/utils/requestMember";
import { requireRequestParent, requireLinkedChild } from "./parentRequest";
import { mutateChild } from "#server/db/ParentChildMaintenanceData";
import { readProfile } from "#server/db/ProfilesData";
import { profileIdentitySchema, profileQuerySchema } from "#shared/types/MemberProfile";
import { profileImageActionSchema, type ProfileImageSlot, type ProfileImageAction } from "#shared/types/ProfileImages";
import { FormatBucketFileName } from "#shared/types/Supabase";
import { memberFromRecord, type MemberModel, type MemberRecord } from "#shared/types/models/MemberModel";

type StoredImage = { path: string; blob: Blob | null };

/** Resolve the existing member image naming convention. */
function imagePath(memberId: string, slot: ProfileImageSlot, extension: string): string {
    return `Members/${slot === "photo" ? "Photos" : "Avatars"}/${FormatBucketFileName("Member", memberId, extension)}`;
}

/** Snapshot both formats so a failed multi-file change can restore previous content. */
async function snapshot(actor: VerifiedMember, memberId: string, slots: ProfileImageSlot[]): Promise<StoredImage[]> {
    const images: StoredImage[] = [];
    for (const slot of slots) for (const extension of ["png", "jpg"]) {
        const path: string = imagePath(memberId, slot, extension);
        const { data, error } = await actor.client.storage.from("coderdojo").download(path);
        if (error && !(String(error.statusCode) === "404" || (String(error.statusCode) === "400" && /not found|does not exist/i.test(error.message)))) throw createError({ statusCode: 503, statusMessage: "Unable to read profile image" });
        images.push({ path, blob: data });
    }
    return images;
}

/** Handle authorized image changes, preserving previous files if persistence fails. */
export async function changeProfileImages(event: H3Event, own: boolean, parent: boolean = false): Promise<MemberModel> {
    const actor: VerifiedMember = parent ? await requireRequestParent(event) : await requireRequestMember(event);
    const identity: ReturnType<typeof profileIdentitySchema.safeParse> = profileIdentitySchema.safeParse(own ? actor.id : getRouterParam(event, "memberId"));
    if (!identity.success) throw createError({ statusCode: 400, statusMessage: "Invalid profile identity" });
    const id: string = identity.data;
    if (!profileQuerySchema.safeParse(getQuery(event)).success) throw createError({ statusCode: 400, statusMessage: "Unexpected query fields" });
    const parsed: ReturnType<typeof profileImageActionSchema.safeParse> = profileImageActionSchema.safeParse(await readBody<unknown>(event));
    if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "Invalid image action" });
    const action: ProfileImageAction = parsed.data;
    if ((action.action === "copyAvatarToPhoto" || action.slot === "photo") && !actor.member.isMentor) {
        throw createError({ statusCode: 403, statusMessage: "Only mentors can change photos" });
    }
    const member: MemberModel = parent ? await requireLinkedChild(actor, id) : (await readProfile(actor, id)).member;
    const png: Buffer | null = action.action === "upload" ? validateProfilePng(action.png) : null;
    if (action.action === "copyAvatarToPhoto" && !member.hasAvatar) throw createError({ statusCode: 409, statusMessage: "Avatar unavailable" });
    const slots: ProfileImageSlot[] = action.action === "copyAvatarToPhoto" ? ["photo"] : [action.slot];
    const before: StoredImage[] = await snapshot(actor, id, action.action === "copyAvatarToPhoto" ? ["photo", "avatar"] : slots);
    const bucket: ReturnType<typeof actor.client.storage.from> = actor.client.storage.from("coderdojo");
    const values: { has_photo: boolean; has_avatar: boolean } = { has_photo: member.hasPhoto, has_avatar: member.hasAvatar };
    try {
        for (const slot of slots) {
            const populated: boolean = action.action === "copyAvatarToPhoto" || action.action === "upload";
            const source: Blob | Buffer | null = action.action === "upload" ? png : action.action === "copyAvatarToPhoto" ? before.find((image: StoredImage): boolean => image.path === imagePath(id, "avatar", "png") && Boolean(image.blob))?.blob ?? before.find((image: StoredImage): boolean => image.path === imagePath(id, "avatar", "jpg"))?.blob ?? null : null;
            if (populated && !source) throw new Error("Missing source image");
            if (source) {
                const { error } = await bucket.upload(imagePath(id, slot, "png"), source, { upsert: true, contentType: source instanceof Blob ? source.type : "image/png", cacheControl: "0" });
                if (error) throw error;
            }
            const { error } = await bucket.remove(source ? [imagePath(id, slot, "jpg")] : [imagePath(id, slot, "png"), imagePath(id, slot, "jpg")]);
            if (error) throw error;
            values[slot === "photo" ? "has_photo" : "has_avatar"] = populated;
        }
        if (parent) return await mutateChild(actor, id, "images", values, { has_photo: member.hasPhoto, has_avatar: member.hasAvatar });
        const { data, error } = await actor.client.schema("coderdojo").from("members").update(values).eq("id", id).eq("deleted", false).eq("has_photo", member.hasPhoto).eq("has_avatar", member.hasAvatar).select("*").maybeSingle();
        if (error || !data) throw new Error("Unable to save image flags");
        return memberFromRecord(data as MemberRecord);
    } catch (failure: unknown) {
        const restored: PromiseSettledResult<void>[] = await Promise.allSettled(before.filter((image: StoredImage): boolean => slots.some((slot: ProfileImageSlot): boolean => ["png", "jpg"].some((extension: string): boolean => image.path === imagePath(id, slot, extension)))).map(async (image: StoredImage): Promise<void> => {
            const result: { error: unknown } = image.blob ? await bucket.upload(image.path, image.blob, { upsert: true, contentType: image.blob.type, cacheControl: "0" }) : await bucket.remove([image.path]);
            if (result.error) throw result.error;
        }));
        if (!restored.some((result: PromiseSettledResult<void>): boolean => result.status === "rejected") && failure instanceof Error && "statusCode" in failure) throw failure;
        throw createError({ statusCode: 503, statusMessage: restored.some((result: PromiseSettledResult<void>): boolean => result.status === "rejected") ? "Image save and recovery failed; reload profile" : "Unable to save images; please retry" });
    }
}
