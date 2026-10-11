import { createError, defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody, maintenanceId } from "#server/utils/maintenanceRequest";
import { maintainMember } from "#server/db/MemberMaintenanceData";
import { passwordResetSchema, type PasswordReset } from "#shared/types/MemberMaintenance";
import { GeneratePasswordHash } from "#server/utils/authUtils";

/** Reset a selected member's password through an explicitly authorized mentor action. */
export default defineEventHandler(async (event: H3Event): Promise<null> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const id: string = maintenanceId(event);
 const body: PasswordReset = await maintenanceBody(event, passwordResetSchema);
 const hash: string | null = await GeneratePasswordHash(body.newPassword, useRuntimeConfig(event).private.auth.pass_salt);
 if (!hash) throw createError({ statusCode: 503, statusMessage: "Unable to set password" });
 await maintainMember(actor, "password", id, { password_hash: hash });
 return null;
});
