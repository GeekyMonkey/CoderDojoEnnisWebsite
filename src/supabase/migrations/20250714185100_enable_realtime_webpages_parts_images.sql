-- Enable the replication on the webpages table in the monkeyschool schema
ALTER PUBLICATION supabase_realtime ADD TABLE monkeyschool.webpages;

-- Ensure the table has the right replica identity
ALTER TABLE monkeyschool.webpages REPLICA IDENTITY FULL;

-- Optional: Add a comment for documentation
COMMENT ON TABLE monkeyschool.webpages IS 'This table is enabled for real-time updates';

-- Enable the replication on the webpageparts table in the monkeyschool schema
ALTER PUBLICATION supabase_realtime ADD TABLE monkeyschool.webpageparts;

-- Ensure the table has the right replica identity
ALTER TABLE monkeyschool.webpageparts REPLICA IDENTITY FULL;

-- Optional: Add a comment for documentation
COMMENT ON TABLE monkeyschool.webpageparts IS 'This table is enabled for real-time updates';

-- Enable the replication on the slideshowimages table in the monkeyschool schema
ALTER PUBLICATION supabase_realtime ADD TABLE monkeyschool.slideshowimages;

-- Ensure the table has the right replica identity
ALTER TABLE monkeyschool.slideshowimages REPLICA IDENTITY FULL;

-- Optional: Add a comment for documentation
COMMENT ON TABLE monkeyschool.slideshowimages IS 'This table is enabled for real-time updates';
