-- Enable the replication on the users table in the monkeyschool schema
ALTER PUBLICATION supabase_realtime ADD TABLE monkeyschool.users;

-- Ensure the table has the right replica identity
ALTER TABLE monkeyschool.users REPLICA IDENTITY FULL;

-- Optional: Add a comment for documentation
COMMENT ON TABLE monkeyschool.users IS 'This table is enabled for real-time updates';
