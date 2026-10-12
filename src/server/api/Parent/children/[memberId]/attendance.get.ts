import { defineEventHandler, type H3Event } from "h3";
import { requireRequestParent, requireLinkedChild } from "#server/utils/parentRequest";
import { maintenanceId } from "#server/utils/maintenanceRequest";
import { readMemberAttendance } from "#server/db/MemberMaintenanceData";
import { attendanceHistorySchema } from "#shared/types/MemberMaintenance";
import type { MemberAttendanceModel } from "#shared/types/models/MemberAttendanceModel";
/** Read dates only after verifying the current child relationship. */
export default defineEventHandler(async(event:H3Event):Promise<MemberAttendanceModel[]>=>{
 const actor:Awaited<ReturnType<typeof requireRequestParent>> = await requireRequestParent(event); const id:string = maintenanceId(event); await requireLinkedChild(actor,id);
 return attendanceHistorySchema.parse(await readMemberAttendance(actor,id));
});
