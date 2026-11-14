import { validationError } from "#server/utils/validationError";
import { defineEventHandler, getRouterParam, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { changeEntityImage } from "#server/utils/entityImages";
import { entityImageActionSchema, type EntityImageAction } from "#shared/types/ImageUpload";
import { teamIdSchema } from "#shared/types/TeamMaintenance";
import { teamFromRecord, type TeamModel } from "#shared/types/models/TeamModel";
import type { TeamRecord } from "#server/db/TeamsData";
/** Validate a mentor's team image request and delegate guarded image storage. */
export default defineEventHandler(async (event: H3Event): Promise<TeamModel> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const identity: ReturnType<typeof teamIdSchema.safeParse> = teamIdSchema.safeParse(getRouterParam(event,"teamId"));
 if (!identity.success) throw validationError(identity.error, "Invalid team ID", "teamId");
 const action: EntityImageAction = await maintenanceBody(event,entityImageActionSchema);
 return teamFromRecord(await changeEntityImage(actor,"team",identity.data,action) as TeamRecord);
});
