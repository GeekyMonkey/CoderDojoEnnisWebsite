SELECT Members.FirstName, Members.LastName, COUNT(DISTINCT MemberAttendance.Id) AS AttendanceCount
FROM     Members
LEFT OUTER JOIN MemberAttendance ON Members.Id = MemberAttendance.MemberId
GROUP BY Members.Id, Members.FirstName, Members.LastName
ORDER BY AttendanceCount
