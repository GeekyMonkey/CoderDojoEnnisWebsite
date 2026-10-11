import { defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { maintainTeam } from "#server/db/TeamMaintenanceData";
import { teamFieldsSchema } from "#shared/types/TeamMaintenance";
import { TeamModelSchema, type TeamModel } from "#shared/types/models/TeamModel";
/** Apply the validated create operation for the verified mentor. */
export default defineEventHandler(async (event: H3Event): Promise<TeamModel> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const id: string = crypto.randomUUID();
 const body: Awaited<ReturnType<typeof maintenanceBody<import("zod").infer<typeof teamFieldsSchema>>>> = await maintenanceBody(event, teamFieldsSchema);
 return TeamModelSchema.parse(await maintainTeam(actor, "create", id, body, null));
});
