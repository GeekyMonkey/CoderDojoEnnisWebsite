-- Add deleted column for soft deletes
ALTER TABLE monkeyschool.users 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create an index for better performance when querying non-deleted users
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON monkeyschool.users(deleted_at);
