-- Add deleted_at column for soft deletes
ALTER TABLE monkeyschool.webPages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create an index for better performance when querying non-deleted pages
CREATE INDEX IF NOT EXISTS idx_webpages_deleted_at ON monkeyschool.webPages(deleted_at);