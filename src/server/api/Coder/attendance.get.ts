import { createError, defineEventHandler, getQuery, setResponseHeader, type H3Event } from "h3";
import { requireRequestMember, type VerifiedMember } from "#server/utils/requestMember";
import { readMemberAttendance } from "#server/db/MemberMaintenanceData";
import { profileQuerySchema } from "#shared/types/MemberProfile";
import { attendanceHistorySchema } from "#shared/types/MemberMaintenance";
import type { MemberAttendanceModel } from "#shared/types/models/MemberAttendanceModel";

/** Return the verified coder's own attendance without accepting a selected member ID. */
export default defineEventHandler(async (event: H3Event): Promise<MemberAttendanceModel[]> => {
 const actor: VerifiedMember = await requireRequestMember(event);
 if (!actor.member.isNinja) throw createError({ statusCode: 403, statusMessage: "Coder access required" });
 if (!profileQuerySchema.safeParse(getQuery(event)).success) throw createError({ statusCode: 400, statusMessage: "Unexpected query fields" });
 setResponseHeader(event, "Cache-Control", "private, no-store");
 return attendanceHistorySchema.parse(await readMemberAttendance(actor, actor.id));
});
