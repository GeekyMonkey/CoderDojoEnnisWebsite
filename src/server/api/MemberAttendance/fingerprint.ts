import { defineEventHandler } from "h3";
import { MemberAttendancesData } from "~~/server/db/MemberAttendancesData";
import { MembersData } from "~~/server/db/MembersData";
import { Member_SetLoginDate } from "~~/shared/types/models/MemberModel";
import { TodayYYYY_MM_dd } from "~~/shared/utils/DateHelpers";

export default defineEventHandler(async (event): Promise<any> => {
  // Access the query string from the event object
  const query = event.node.req.url
    ? new URL(event.node.req.url, `http://${event.node.req.headers.host}`)
        .searchParams
    : new URLSearchParams();
  const fingerprintId: number = Number(query.get("id") || -1);
  const testing: boolean = Boolean(query.get("testing") == "true");

  // Get the member
  const member = await MembersData.GetMemberByFingerprintId(event, fingerprintId);
  if (!member) {
    console.warn(`No member found with fingerprint ID ${fingerprintId}`);
    // return a 400 status
    event.node.res.statusCode = 400;
    return {
      error: `No member found with fingerprint ID ${fingerprintId}`,
    };
  }

  // Create an attendance record for this user/date
  if (!testing) {
    await MemberAttendancesData.CreateMemberAttendance(event,
      member.id,
      TodayYYYY_MM_dd()
    );
  }

  // Get the member's new attendance count
  const sessionCount: number = await MemberAttendancesData.GetMemberAttendancesCountForMember(
    event,
    member.id,
  );
  if (testing) {
    sessionCount + 1;
  }

  // Remember the member's login date
  Member_SetLoginDate(member);
  MembersData.SaveMember(event, member);

  // Format the response
  const response: AttendanceSignInResponseModel = {
    memberId: member.id,
    memberName: member.nameFirst + " " + member.nameLast,
    memberSessionCount: sessionCount,
    memberMessage: "ToDo: Custom message here",
    memberDetails: member,
  };

  return response;
});
