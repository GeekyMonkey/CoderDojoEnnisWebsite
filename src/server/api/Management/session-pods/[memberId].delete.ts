import { defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody, maintenanceId } from "#server/utils/maintenanceRequest";
import { maintainSessionPod } from "#server/db/SessionManagementData";
import { sessionDeleteSchema, type SessionDelete } from "#shared/types/SessionMaintenance";
/** Archive a selected pod only while its exact stored snapshot remains current. */
export default defineEventHandler(async (event: H3Event): Promise<null> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const id: string = maintenanceId(event);
 const body: SessionDelete = await maintenanceBody(event, sessionDeleteSchema);
 await maintainSessionPod(actor, "delete", id, null, body.expected);
 return null;
});
