import { defineEventHandler, getRequestURL, type H3Event } from "h3";
import { requireRequestMentor } from "#server/utils/requestMentor";

const MENTOR_READ_PREFIXES: string[] = ["/api/members/", "/api/memberbelts/", "/api/teams/"];
const MENTOR_ATTENDANCE_READS: string[] = ["/api/memberattendance/sessiondate", "/api/memberattendance/sessiondates", "/api/memberattendance/sessionstats", "/api/memberattendance/sessioncurrent", "/api/memberattendance/sessiondaterange"];

/** Guard legacy complete-directory readers whose service clients bypass table RLS. */
export default defineEventHandler(async (event: H3Event): Promise<void> => {
 const path: string = decodeURI(getRequestURL(event).pathname).toLowerCase().replace(/\/+$/, "");
 if (MENTOR_READ_PREFIXES.some((prefix: string): boolean => path.startsWith(prefix)) || MENTOR_ATTENDANCE_READS.includes(path)) {
  await requireRequestMentor(event);
 }
});
