-- Remove school_board column from users table
ALTER TABLE monkeyschool.users 
DROP COLUMN IF EXISTS school_board;
