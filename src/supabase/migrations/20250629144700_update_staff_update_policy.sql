-- Update the staff update policy to properly check for staff roles
-- This allows principals, teachers, and admins to update any user

-- First drop the existing policy
DROP POLICY IF EXISTS "Enable update for staff users" ON monkeyschool.users;

-- Create the updated policy
CREATE POLICY "Enable update for staff users"
ON monkeyschool.users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM monkeyschool.users
    WHERE id = auth.uid() 
    AND (principal = true OR teacher = true OR admin = true)
  )
);

-- Add a comment for documentation
COMMENT ON POLICY "Enable update for staff users" ON monkeyschool.users 
IS 'Allows staff members (principals, teachers, admins) to update any user record';
