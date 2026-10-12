import { defineEventHandler, type H3Event } from "h3";
import { requireRequestCoder } from "#server/utils/coderRequest";
import { maintenanceBody } from "#server/utils/maintenanceRequest";
import { joinOwnSession } from "#server/db/CoderSessionsData";
import { coderSessionJoinSchema, type CoderSessionJoin, type CoderSessionJoined } from "#shared/types/CoderSession";
/** Join one session without accepting an actor ID or URL from the client. */
export default defineEventHandler(async (event: H3Event): Promise<CoderSessionJoined> => {
 const actor: Awaited<ReturnType<typeof requireRequestCoder>> = await requireRequestCoder(event);
 const body: CoderSessionJoin = await maintenanceBody(event, coderSessionJoinSchema);
 return joinOwnSession(actor, body.sessionId);
});
