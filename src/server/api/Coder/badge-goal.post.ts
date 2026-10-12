import { defineEventHandler,type H3Event } from "h3";
import { requireRequestCoder } from "#server/utils/coderRequest";
import { maintenanceBody } from "#server/utils/maintenanceRequest";
import { badgeGoalChangeSchema,type BadgeGoalChange } from "#shared/types/Coder";
import { coderAction } from "#server/db/CoderActionsData";
/** Select or remove a personal badge goal without changing application evidence. */
export default defineEventHandler(async(event:H3Event):Promise<null>=>{
 const actor:Awaited<ReturnType<typeof requireRequestCoder>> = await requireRequestCoder(event);
 const body:BadgeGoalChange = await maintenanceBody(event,badgeGoalChangeSchema);
 await coderAction(actor,"goal","badge",body.definitionId,{selected:body.selected},{goalDate:body.expectedGoalDate===null?null:new Date(body.expectedGoalDate).toISOString()});
 return null;
});
