import { createError, defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { maintainMemberDetails, storageFields } from "#server/db/MemberMaintenanceData";
import { newMemberSchema, type NewMember } from "#shared/types/MemberMaintenance";
import type { MemberModel } from "#shared/types/models/MemberModel";
import { GeneratePasswordHash } from "#server/utils/authUtils";

/** Register a coder or adult with a server-generated identity. */
export default defineEventHandler(async (event: H3Event): Promise<MemberModel> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const body: NewMember = await maintenanceBody(event, newMemberSchema);
 const hash: string | null = body.password === null ? null : await GeneratePasswordHash(body.password, useRuntimeConfig(event).private.auth.pass_salt);
 if (body.password !== null && !hash) throw createError({ statusCode: 503, statusMessage: "Unable to set password" });
 return maintainMemberDetails(actor, "create", crypto.randomUUID(), { ...storageFields(body.profile), ...storageFields(body.account), password_hash: hash, attendance_date: body.attendanceDate });
});
