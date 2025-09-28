-- Migration: Explicit realtime enablement for coderdojo schema tables
-- Purpose: Provide a clear, reviewable list of statements you can prune or edit
-- before executing. Each section includes:
--   1. Add table to supabase_realtime publication (realtime events)
--   2. (Commented) REPLICA IDENTITY FULL toggle (uncomment where needed)
--   3. Optional COMMENT for documentation
--
-- NOTE: Leave REPLICA IDENTITY FULL commented unless you need old row *non-PK* values
-- on UPDATE/DELETE events or you have tables without a primary key. FULL increases
-- WAL size so apply selectively.
--
-- Safe re-run: Duplicate additions will error; convert to DO blocks with EXCEPTION WHEN duplicate_object THEN NULL
-- if you want pure idempotency after finalizing selection.

---------------------------
-- Belts
ALTER PUBLICATION supabase_realtime ADD TABLE coderdojo.belts;
ALTER TABLE coderdojo.belts REPLICA IDENTITY FULL;
COMMENT ON TABLE coderdojo.belts IS 'Realtime enabled';

---------------------------
-- Badge Categories
ALTER PUBLICATION supabase_realtime ADD TABLE coderdojo.badge_categories;
ALTER TABLE coderdojo.badge_categories REPLICA IDENTITY FULL;
COMMENT ON TABLE coderdojo.badge_categories IS 'Realtime enabled';

---------------------------
-- Badges
ALTER PUBLICATION supabase_realtime ADD TABLE coderdojo.badges;
ALTER TABLE coderdojo.badges REPLICA IDENTITY FULL;
COMMENT ON TABLE coderdojo.badges IS 'Realtime enabled';

---------------------------
-- Teams
ALTER PUBLICATION supabase_realtime ADD TABLE coderdojo.teams;
ALTER TABLE coderdojo.teams REPLICA IDENTITY FULL;
COMMENT ON TABLE coderdojo.teams IS 'Realtime enabled';

---------------------------
-- Members
ALTER PUBLICATION supabase_realtime ADD TABLE coderdojo.members;
ALTER TABLE coderdojo.members REPLICA IDENTITY FULL; -- Potentially large table
COMMENT ON TABLE coderdojo.members IS 'Realtime enabled';

---------------------------
-- Sessions
ALTER PUBLICATION supabase_realtime ADD TABLE coderdojo.sessions;
ALTER TABLE coderdojo.sessions REPLICA IDENTITY FULL;
COMMENT ON TABLE coderdojo.sessions IS 'Realtime enabled';

---------------------------
-- Member Attendances
ALTER PUBLICATION supabase_realtime ADD TABLE coderdojo.member_attendances;
ALTER TABLE coderdojo.member_attendances REPLICA IDENTITY FULL; -- High churn table
COMMENT ON TABLE coderdojo.member_attendances IS 'Realtime enabled';

---------------------------
-- Member Badge Categories
ALTER PUBLICATION supabase_realtime ADD TABLE coderdojo.member_badge_categories;
ALTER TABLE coderdojo.member_badge_categories REPLICA IDENTITY FULL;
COMMENT ON TABLE coderdojo.member_badge_categories IS 'Realtime enabled';

---------------------------
-- Member Parents
ALTER PUBLICATION supabase_realtime ADD TABLE coderdojo.member_parents;
ALTER TABLE coderdojo.member_parents REPLICA IDENTITY FULL;
COMMENT ON TABLE coderdojo.member_parents IS 'Realtime enabled';

---------------------------
-- Member Belts
ALTER PUBLICATION supabase_realtime ADD TABLE coderdojo.member_belts;
ALTER TABLE coderdojo.member_belts REPLICA IDENTITY FULL;
COMMENT ON TABLE coderdojo.member_belts IS 'Realtime enabled';

---------------------------
-- Member Badges
ALTER PUBLICATION supabase_realtime ADD TABLE coderdojo.member_badges;
ALTER TABLE coderdojo.member_badges REPLICA IDENTITY FULL;
COMMENT ON TABLE coderdojo.member_badges IS 'Realtime enabled';

------------------------------------------------------------
-- OPTIONAL: Idempotent wrapper example for one table (pattern)
-- DO $$ BEGIN
--   BEGIN
--     ALTER PUBLICATION supabase_realtime ADD TABLE coderdojo.belts;
--   EXCEPTION WHEN duplicate_object THEN NULL; END;
--   -- ALTER TABLE coderdojo.belts REPLICA IDENTITY FULL;
-- END $$;
------------------------------------------------------------

-- Verification queries (run manually, not part of migration):
--   SELECT p.pubname, pt.schemaname, pt.tablename
--   FROM pg_publication p
--   JOIN pg_publication_tables pt ON pt.pubname = p.pubname
--   WHERE p.pubname='supabase_realtime' AND pt.schemaname='coderdojo'
--   ORDER BY pt.tablename;
--   SELECT relname, relreplident FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname='coderdojo' AND relkind='r';
