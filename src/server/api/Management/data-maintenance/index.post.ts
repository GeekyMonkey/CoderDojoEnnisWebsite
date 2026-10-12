import type { H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { maintainData } from "#server/db/DataMaintenanceData";
import { dataMaintenanceRequestSchema, type DataMaintenanceRequest, type DataMaintenanceReport } from "#shared/types/DataMaintenance";

/** Apply exactly the reviewed maintenance preview for a current mentor. */
export default defineEventHandler(async (event: H3Event): Promise<DataMaintenanceReport> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const body: DataMaintenanceRequest = await maintenanceBody(event, dataMaintenanceRequestSchema);
 setResponseHeader(event, "Cache-Control", "private, no-store");
 return maintainData(actor, body.action, body.revision);
});
