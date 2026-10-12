import { defineEventHandler,type H3Event } from "h3";
import { requireRequestCoder } from "#server/utils/coderRequest";
import { maintenanceBody } from "#server/utils/maintenanceRequest";
import { goalUpdateSchema,type GoalFields,type GuardedUpdate } from "#shared/types/MemberMaintenance";
import { coderAction } from "#server/db/CoderActionsData";
/** Save only the authenticated coder's goals with their exact original snapshot. */
export default defineEventHandler(async(event:H3Event):Promise<null>=>{
 const actor:Awaited<ReturnType<typeof requireRequestCoder>> = await requireRequestCoder(event);
 const body:GuardedUpdate<GoalFields> = await maintenanceBody(event,goalUpdateSchema);
 await coderAction(actor,"goals",null,null,body.fields,body.expected);
 return null;
});
