import { createError, getRouterParam, type H3Event } from "h3";
import { maintenanceActor } from "#server/utils/maintenanceRequest";
import { maintainData } from "#server/db/DataMaintenanceData";
import { dataMaintenanceActionSchema, type DataMaintenanceReport } from "#shared/types/DataMaintenance";

/** Read a mentor-only maintenance preview without changing any records. */
export default defineEventHandler(async (event: H3Event): Promise<DataMaintenanceReport> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const action: ReturnType<typeof dataMaintenanceActionSchema.safeParse> = dataMaintenanceActionSchema.safeParse(getRouterParam(event, "action"));
 if (!action.success) throw createError({ statusCode: 400, statusMessage: "Invalid maintenance action" });
 setResponseHeader(event, "Cache-Control", "private, no-store");
 return maintainData(actor, action.data);
});
