import { defineEventHandler, setResponseHeader, type H3Event } from "h3";
import { maintenanceActor } from "#server/utils/maintenanceRequest";
import { readSessionManagement } from "#server/db/SessionManagementData";
import type { SessionManagement } from "#shared/types/SessionMaintenance";
/** Read pod management and host choices only for a current active mentor. */
export default defineEventHandler(async (event: H3Event): Promise<SessionManagement> => {
 setResponseHeader(event, "Cache-Control", "private, no-store");
 return readSessionManagement(await maintenanceActor(event));
});
