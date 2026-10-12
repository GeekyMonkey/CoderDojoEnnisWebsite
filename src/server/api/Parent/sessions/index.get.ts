import { defineEventHandler, type H3Event } from "h3";
import { requireRequestParent } from "#server/utils/parentRequest";
import { maintenanceBody } from "#server/utils/maintenanceRequest";
import { readCoderSessions } from "#server/db/CoderSessionsData";
import { coderSessionsSchema, coderSessionJoinSchema, type CoderSession, type CoderSessionJoined } from "#shared/types/CoderSession";
/** List upcoming public pods for the verified parent. */
export default defineEventHandler(async(event:H3Event):Promise<CoderSession[]>=>{
 const actor:Awaited<ReturnType<typeof requireRequestParent>> = await requireRequestParent(event);
 
 return coderSessionsSchema.parse(await readCoderSessions(actor));
});
