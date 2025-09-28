-- Create an RPC that returns member attendance stats per date (date and count)
CREATE OR REPLACE FUNCTION coderdojo.get_attendance_stats()
RETURNS TABLE(date text, attendance_count bigint) AS $$
  SELECT
    date,
    COUNT(*)::bigint AS attendance_count
  FROM coderdojo.member_attendances
  WHERE date IS NOT NULL
  GROUP BY date
  ORDER BY date DESC;
$$ LANGUAGE sql STABLE;

-- Grant execute so the function can be used where appropriate
GRANT EXECUTE ON FUNCTION coderdojo.get_attendance_stats() TO PUBLIC;
