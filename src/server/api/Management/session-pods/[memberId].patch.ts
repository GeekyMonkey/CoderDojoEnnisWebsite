import { defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody, maintenanceId } from "#server/utils/maintenanceRequest";
import { maintainSessionPod } from "#server/db/SessionManagementData";
import { sessionUpdateSchema, managedSessionSchema, type ManagedSession, type SessionUpdate } from "#shared/types/SessionMaintenance";
/** Save a selected pod only while its exact stored snapshot remains current. */
export default defineEventHandler(async (event: H3Event): Promise<ManagedSession> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const id: string = maintenanceId(event);
 const body: SessionUpdate = await maintenanceBody(event, sessionUpdateSchema);
 return managedSessionSchema.parse(await maintainSessionPod(actor, "update", id, body.fields, body.expected));
});
