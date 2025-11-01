 SELECT MAX(x.[date]),  -- change to MAX if you want the highest
         x.MemberId 
    FROM MemberAttendance x
    JOIN (SELECT a.MemberId,
                 MAX([date]) AS max_date
            FROM MemberAttendance a
        GROUP BY a.MemberId) y ON y.MemberId = x.MemberId
                              AND y.max_date = x.date
GROUP BY x.[Date], x.MemberId