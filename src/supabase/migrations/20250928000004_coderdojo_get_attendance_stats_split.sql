-- Create an RPC that returns attendance counts split by role (mentor / ninja) per date
CREATE OR REPLACE FUNCTION coderdojo.get_attendance_stats_split()
RETURNS TABLE(date text, mentor_count bigint, ninja_count bigint, total_count bigint) AS $$
  SELECT
    ma.date,
    SUM(CASE WHEN m.is_mentor THEN 1 ELSE 0 END)::bigint AS mentor_count,
    SUM(CASE WHEN m.is_ninja THEN 1 ELSE 0 END)::bigint AS ninja_count,
    COUNT(*)::bigint AS total_count
  FROM coderdojo.member_attendances ma
  LEFT JOIN coderdojo.members m ON m.id = ma.member_id
  WHERE ma.date IS NOT NULL
  GROUP BY ma.date
  ORDER BY ma.date DESC;
$$ LANGUAGE sql STABLE;

-- Grant execute so the function can be called by the API/admin roles
GRANT EXECUTE ON FUNCTION coderdojo.get_attendance_stats_split() TO PUBLIC;
