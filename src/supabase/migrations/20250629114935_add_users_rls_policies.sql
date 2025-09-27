-- Enable RLS on the users table
ALTER TABLE monkeyschool.users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read users (non-deleted users only)
CREATE POLICY "Enable read access for all users"
ON monkeyschool.users
FOR SELECT
USING (deleted_at IS NULL);

-- Allow users to update themselves
CREATE POLICY "Enable update for users based on id"
ON monkeyschool.users
FOR UPDATE
USING (auth.uid() = id);

-- Allow principals, teachers, and admins to update any user
CREATE POLICY "Enable update for staff users"
ON monkeyschool.users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM monkeyschool.users u 
    WHERE u.id = auth.uid() 
    AND (u.principal = true OR u.teacher = true OR u.admin = true)
  )
);

-- Prevent all deletes (including soft deletes) through the API
-- Note: This doesn't prevent direct database access
CREATE POLICY "Prevent all deletes"
ON monkeyschool.users
FOR DELETE
USING (false);

-- Allow inserts (with appropriate permissions handled by your application)
CREATE POLICY "Enable insert for authenticated users"
ON monkeyschool.users
FOR INSERT
TO authenticated
WITH CHECK (true);