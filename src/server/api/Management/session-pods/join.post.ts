import { defineEventHandler, type H3Event } from "h3";
import { maintenanceActor, maintenanceBody } from "#server/utils/maintenanceRequest";
import { joinOwnSession } from "#server/db/CoderSessionsData";
import { coderSessionJoinSchema, type CoderSessionJoin, type CoderSessionJoined } from "#shared/types/CoderSession";
/** Join public or mentor-only pods and record only the authenticated mentor's attendance. */
export default defineEventHandler(async (event: H3Event): Promise<CoderSessionJoined> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 const body: CoderSessionJoin = await maintenanceBody(event, coderSessionJoinSchema);
 return joinOwnSession(actor, body.sessionId);
});
