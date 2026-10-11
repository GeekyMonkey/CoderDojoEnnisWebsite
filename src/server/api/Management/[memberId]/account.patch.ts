import { defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody, maintenanceId } from "#server/utils/maintenanceRequest";
import { maintainMemberDetails, storageFields } from "#server/db/MemberMaintenanceData";
import { accountUpdateSchema, type AccountFields, type GuardedUpdate } from "#shared/types/MemberMaintenance";
import type { MemberModel } from "#shared/types/models/MemberModel";

/** Save only the selected account section with its original snapshot. */
export default defineEventHandler(async (event: H3Event): Promise<MemberModel> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const body: GuardedUpdate<AccountFields> = await maintenanceBody(event, accountUpdateSchema);
 return maintainMemberDetails(actor, "account", maintenanceId(event), storageFields(body.fields), storageFields(body.expected));
});
