import { defineEventHandler, type H3Event } from "h3";
import { requireRequestParent } from "#server/utils/parentRequest";
import { maintenanceBody } from "#server/utils/maintenanceRequest";
import { joinOwnSession } from "#server/db/CoderSessionsData";
import { coderSessionJoinedSchema, coderSessionJoinSchema, type CoderSession, type CoderSessionJoined } from "#shared/types/CoderSession";
/** Join a public session and record only the authenticated parent attendance. */
export default defineEventHandler(async(event:H3Event):Promise<CoderSessionJoined>=>{
 const actor:Awaited<ReturnType<typeof requireRequestParent>> = await requireRequestParent(event);
 const body:ReturnType<typeof coderSessionJoinSchema.parse> = await maintenanceBody(event,coderSessionJoinSchema);
 return coderSessionJoinedSchema.parse(await joinOwnSession(actor,body.sessionId));
});
