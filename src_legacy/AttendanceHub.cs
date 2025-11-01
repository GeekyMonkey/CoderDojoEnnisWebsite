using System;
using Microsoft.AspNet.SignalR;

namespace CoderDojo
{
    public class AttendanceHub : Hub
    {
        public void OnAttendanceChange(DateTime attendanceDate, Guid memberId, string memberName, string teamId, bool present, int memberSessionCount, int dojoAttendanceCount, string memberMessage, string memberImageUrl)
        {
            // Call te broadcastMessage method to update clients.
            Clients.Others.OnAttendanceChange(attendanceDate.ToString("dd-MMM-yyyy"), memberId.ToString("N"), memberName, teamId, present.ToString().ToLower(), memberSessionCount, dojoAttendanceCount, memberMessage, memberImageUrl);
        }
    }
}
