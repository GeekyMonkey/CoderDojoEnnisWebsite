-- Enable the replication on the classes table in the monkeyschool schema
ALTER PUBLICATION supabase_realtime ADD TABLE monkeyschool.classes;

-- Ensure the table has the right replica identity
ALTER TABLE monkeyschool.classes REPLICA IDENTITY FULL;

-- Optional: Add a comment for documentation
COMMENT ON TABLE monkeyschool.classes IS 'This table is enabled for real-time updates';

-- Enable the replication on the years table in the monkeyschool schema
ALTER PUBLICATION supabase_realtime ADD TABLE monkeyschool.years;

-- Ensure the table has the right replica identity
ALTER TABLE monkeyschool.years REPLICA IDENTITY FULL;

-- Optional: Add a comment for documentation
COMMENT ON TABLE monkeyschool.years IS 'This table is enabled for real-time updates';
