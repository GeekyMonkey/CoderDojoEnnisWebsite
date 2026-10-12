import { defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { maintainSessionPod } from "#server/db/SessionManagementData";
import { sessionFieldsSchema, managedSessionSchema, type SessionFields, type ManagedSession } from "#shared/types/SessionMaintenance";
/** Create a pod with validated fields and the legacy 2.5-hour availability window. */
export default defineEventHandler(async (event: H3Event): Promise<ManagedSession> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const body: SessionFields = await maintenanceBody(event, sessionFieldsSchema);
 return managedSessionSchema.parse(await maintainSessionPod(actor, "create", null, body, null));
});
