-- Add staff boolean column
alter table monkeyschool.users 
add column if not exists staff boolean not null default false;

-- Add computed column for teacher/principal/staff
-- Note: We need to drop the column first if it exists to avoid errors
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'monkeyschool' 
               AND table_name = 'users' 
               AND column_name = 'is_teacher_or_staff') THEN
        ALTER TABLE monkeyschool.users DROP COLUMN is_teacher_or_staff;
    END IF;
    
    ALTER TABLE monkeyschool.users
    ADD COLUMN is_teacher_or_staff BOOLEAN 
    GENERATED ALWAYS AS (teacher OR principal OR staff) STORED;
    
    -- Update existing rows to ensure the computed column is populated
    -- This is handled automatically by the GENERATED ALWAYS AS clause
END $$;

-- Update the realtime publication to include the new columns
-- (if not already included)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'monkeyschool' 
        AND tablename = 'users'
    ) THEN
        ALTER PUBLICATION supabase_realtime 
        ADD TABLE monkeyschool.users;
    END IF;
END $$;
