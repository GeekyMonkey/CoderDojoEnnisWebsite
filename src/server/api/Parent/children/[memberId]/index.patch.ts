import {defineEventHandler,type H3Event} from "h3";
import {requireRequestParent} from "#server/utils/parentRequest";
import {maintenanceId,maintenanceBody} from "#server/utils/maintenanceRequest";
import {saveChild} from "#server/db/ParentChildMaintenanceData";
import {childUpdateSchema,childMemberSchema,type ChildMember} from "#shared/types/Parent";
/** Save only the linked-child account allowlist using its original snapshot. */
export default defineEventHandler(async(event:H3Event):Promise<ChildMember>=>childMemberSchema.parse(await saveChild(await requireRequestParent(event),maintenanceId(event),await maintenanceBody(event,childUpdateSchema))));
