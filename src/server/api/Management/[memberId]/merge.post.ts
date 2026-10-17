import { defineEventHandler, createError, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody, maintenanceId } from "#server/utils/maintenanceRequest";
import { MemberMergeSchema, MERGE_FIELDS, type MemberMerge, type MergeField } from "#shared/types/MemberMerge";
import { withMergedProfileImages } from "#server/utils/memberMergeImages";
import { storageFields } from "#server/db/MemberMaintenanceData";
import { memberFromRecord, memberToRecord, type MemberRecord, type MemberModel } from "#shared/types/models/MemberModel";
/** Remove credentials and volatile sign-in dates from the preview conflict snapshot. */
function snapshot(member: MemberModel): Record<string, unknown> {
 const value: Record<string, unknown> = { ...memberToRecord(member) };
 delete value.login_date; delete value.login_date_previous;
 return value;
}
/** Merge only the two validated, previewed accounts in one mentor-only transaction. */
export default defineEventHandler(async (event: H3Event): Promise<MemberModel> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const id: string = maintenanceId(event);
 const body: MemberMerge = await maintenanceBody(event, MemberMergeSchema);
 if (id !== body.expectedKeep.id) throw createError({ statusCode: 400, statusMessage: "Invalid survivor" });
 const selected: Record<string, unknown> = {};
 for (const field of MERGE_FIELDS) selected[field] = body.choices[field as MergeField] === "duplicate" ? body.expectedDuplicate[field] : body.expectedKeep[field];
 const fields: Record<string, unknown> = storageFields(selected);
 fields.has_photo = body.images.photo !== "none";
 fields.has_avatar = body.images.avatar !== "none";
 return withMergedProfileImages(actor, body, async (): Promise<MemberModel> => {
 const { data, error } = await actor.client.schema("coderdojo").rpc("merge_members", { p_actor: actor.id, p_keep: id, p_duplicate: body.duplicateId, p_fields: fields, p_expected_keep: snapshot(body.expectedKeep), p_expected_duplicate: snapshot(body.expectedDuplicate) });
 if (error) throw createError({ statusCode: error.code === "42501" ? 403 : error.code === "P0002" ? 404 : error.code === "22023" ? 400 : ["40001", "P0001", "23505"].includes(error.code) ? 409 : 503, statusMessage: ["42501", "P0002", "22023", "40001", "P0001"].includes(error.code) ? error.message : "Unable to merge accounts" });
 return memberFromRecord(data as MemberRecord);
 });
});
