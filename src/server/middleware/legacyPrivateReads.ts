import { defineEventHandler, getRequestURL, type H3Event } from "h3";
import { requireRequestMentor } from "#server/utils/requestMentor";

const MENTOR_READ_PREFIXES: string[] = ["/api/members/", "/api/memberBelts/", "/api/teams/"];
const MENTOR_ATTENDANCE_READS: string[] = ["/api/MemberAttendance/SessionDate", "/api/MemberAttendance/SessionDates", "/api/MemberAttendance/SessionStats"];

/** Guard legacy complete-directory readers whose service clients bypass table RLS. */
export default defineEventHandler(async (event: H3Event): Promise<void> => {
 const path: string = getRequestURL(event).pathname;
 if (MENTOR_READ_PREFIXES.some((prefix: string): boolean => path.startsWith(prefix)) || MENTOR_ATTENDANCE_READS.includes(path)) {
  await requireRequestMentor(event);
 }
});
