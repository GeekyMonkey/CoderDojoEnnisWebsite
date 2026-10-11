import { defineEventHandler, setResponseHeader, type H3Event } from "h3";
import { maintenanceActor, maintenanceId } from "#server/utils/maintenanceRequest";
import { readMemberAttendance } from "#server/db/MemberMaintenanceData";
import type { MemberAttendanceModel } from "#shared/types/models/MemberAttendanceModel";

/** Load a selected member's attendance dates. */
export default defineEventHandler(async (event: H3Event): Promise<MemberAttendanceModel[]> => {
 const actor: Awaited<ReturnType<typeof maintenanceActor>> = await maintenanceActor(event);
 setResponseHeader(event, "Cache-Control", "private, no-store");
 return readMemberAttendance(actor, maintenanceId(event));
});
