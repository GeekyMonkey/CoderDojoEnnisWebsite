import { defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody, maintenanceId } from "#server/utils/maintenanceRequest";
import { maintainMemberDetails, storageFields } from "#server/db/MemberMaintenanceData";
import { goalUpdateSchema, type GoalFields, type GuardedUpdate } from "#shared/types/MemberMaintenance";
import type { MemberModel } from "#shared/types/models/MemberModel";

/** Save only the selected goals section with its original snapshot. */
export default defineEventHandler(async (event: H3Event): Promise<MemberModel> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const body: GuardedUpdate<GoalFields> = await maintenanceBody(event, goalUpdateSchema);
 return maintainMemberDetails(actor, "goals", maintenanceId(event), storageFields(body.fields), storageFields(body.expected));
});
