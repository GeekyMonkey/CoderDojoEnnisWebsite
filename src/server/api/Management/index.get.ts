import { defineEventHandler, setResponseHeader, type H3Event } from "h3";
import { maintenanceActor } from "#server/utils/maintenanceRequest";
import { readMaintenance } from "#server/db/MemberMaintenanceData";
import type { MaintenanceData } from "#shared/types/MemberMaintenance";

/** Load maintenance lookups only for a verified mentor. */
export default defineEventHandler(async (event: H3Event): Promise<MaintenanceData> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 setResponseHeader(event, "Cache-Control", "private, no-store");
 return readMaintenance(actor);
});
