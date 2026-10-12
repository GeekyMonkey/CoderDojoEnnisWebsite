import { defineEventHandler, type H3Event } from "h3";
import { requireRequestParent } from "#server/utils/parentRequest";
import { maintenanceId } from "#server/utils/maintenanceRequest";
import { readChild } from "#server/db/ParentData";
import { parentChildSchema, type ParentChild } from "#shared/types/Parent";
/** Read a relationship-scoped child summary and safe related presentation data. */
export default defineEventHandler(async(event:H3Event):Promise<ParentChild>=>parentChildSchema.parse(await readChild(await requireRequestParent(event),maintenanceId(event))));
