-- Create an RPC that returns distinct member attendance dates in descending order
CREATE OR REPLACE FUNCTION coderdojo.get_attendance_dates()
RETURNS TABLE(date text) AS $$
  SELECT DISTINCT date
  FROM coderdojo.member_attendances
  WHERE date IS NOT NULL
  ORDER BY date DESC;
$$ LANGUAGE sql STABLE;

-- Grant execute to authenticated/anon if your Supabase setup needs it
-- GRANT EXECUTE ON FUNCTION coderdojo.get_attendance_dates() TO authenticated;
-- Create an index on the date column to speed DISTINCT and ORDER BY operations.
-- IF NOT EXISTS is used to be safe on re-runs.
CREATE INDEX IF NOT EXISTS idx_member_attendances_date ON coderdojo.member_attendances (date);

-- Create an index on member_id to speed lookups by member.
-- Use IF NOT EXISTS so the migration is safe to re-run.
CREATE INDEX IF NOT EXISTS idx_member_attendances_member_id ON coderdojo.member_attendances (member_id);

-- Make function callable by any role (PUBLIC). If you prefer to restrict to
-- the authenticated/anon roles, change this to those roles instead.
GRANT EXECUTE ON FUNCTION coderdojo.get_attendance_dates() TO PUBLIC;

-- Ensure a unique constraint on (member_id, date) so upserts on member/date are reliable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'member_attendances_member_date_unique'
  ) THEN
    ALTER TABLE coderdojo.member_attendances
    ADD CONSTRAINT member_attendances_member_date_unique UNIQUE (member_id, date);
  END IF;
END
$$;
