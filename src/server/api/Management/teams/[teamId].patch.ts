import { defineEventHandler, createError, getRouterParam, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { maintainTeam } from "#server/db/TeamMaintenanceData";
import { teamUpdateSchema, teamIdSchema } from "#shared/types/TeamMaintenance";
import { TeamModelSchema, type TeamModel } from "#shared/types/models/TeamModel";
/** Apply the validated update operation for the verified mentor. */
export default defineEventHandler(async (event: H3Event): Promise<TeamModel> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const parsed: ReturnType<typeof teamIdSchema.safeParse> = teamIdSchema.safeParse(getRouterParam(event, "teamId"));
 if (!parsed.success) throw createError({ statusCode: 400, statusMessage: "Invalid team ID" });
 const id: string = parsed.data;
 const body: Awaited<ReturnType<typeof maintenanceBody<import("zod").infer<typeof teamUpdateSchema>>>> = await maintenanceBody(event, teamUpdateSchema);
 return TeamModelSchema.parse(await maintainTeam(actor, "update", id, body.fields, body.expected));
});
