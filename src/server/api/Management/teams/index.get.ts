import { defineEventHandler, setResponseHeader, type H3Event } from "h3";
import { maintenanceActor } from "#server/utils/maintenanceRequest";
import { readTeams } from "#server/db/TeamMaintenanceData";
import { teamListSchema } from "#shared/types/TeamMaintenance";
import type { TeamModel } from "#shared/types/models/TeamModel";
/** Load validated active teams for a verified mentor. */
export default defineEventHandler(async (event: H3Event): Promise<TeamModel[]> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 setResponseHeader(event, "Cache-Control", "private, no-store");
 return teamListSchema.parse(await readTeams(actor));
});
