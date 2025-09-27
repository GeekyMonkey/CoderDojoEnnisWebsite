-- Remove the old password column now that we've migrated to password_hash
-- This is safe because we've verified the new password system works

-- First, drop any constraints or indexes on the password column
-- (Add any specific constraints if they exist on your password column)

-- Now safely drop the column if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'monkeyschool' 
              AND table_name = 'users' 
              AND column_name = 'password') THEN
        ALTER TABLE monkeyschool.users DROP COLUMN password;
        RAISE NOTICE 'Dropped password column from users table';
    ELSE
        RAISE NOTICE 'Password column does not exist in users table';
    END IF;
END $$;

-- Update the comment on the table to reflect the change
COMMENT ON COLUMN monkeyschool.users.password_hash IS 'SHA-256 hash of lowercase password with salt format: H@5h: + user_id';

-- Drop the generate_password_hash function since it's no longer needed for new passwords
-- (We keep verify_password as it's used for login)
-- DROP FUNCTION IF EXISTS monkeyschool.generate_password_hash(TEXT, TEXT);
