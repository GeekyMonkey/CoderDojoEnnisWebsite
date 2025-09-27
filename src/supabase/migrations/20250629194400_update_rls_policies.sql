-- Drop existing policies and create new ones
BEGIN;

-- *** USERS TABLE ***
-- Drop existing policies on users table
DROP POLICY IF EXISTS "Enable read access for all users" ON monkeyschool.users;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON monkeyschool.users;
DROP POLICY IF EXISTS "Enable update for users based on staff role" ON monkeyschool.users;
DROP POLICY IF EXISTS "Enable delete for staff users" ON monkeyschool.users;

-- Create new policies for users table
CREATE POLICY "Allow read access for all users"
  ON monkeyschool.users
  FOR SELECT
  USING (true);

CREATE POLICY "Deny insert for regular users"
  ON monkeyschool.users
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny update for regular users"
  ON monkeyschool.users
  FOR UPDATE
  USING (false);

CREATE POLICY "Deny delete for regular users"
  ON monkeyschool.users
  FOR DELETE
  USING (false);

-- *** CLASSES TABLE ***
-- Drop existing policies on classes table
DROP POLICY IF EXISTS "Enable read access for all users" ON monkeyschool.classes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON monkeyschool.classes;
DROP POLICY IF EXISTS "Enable update for users based on id" ON monkeyschool.classes;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON monkeyschool.classes;

-- Create new policies for classes table
CREATE POLICY "Allow read access for all users"
  ON monkeyschool.classes
  FOR SELECT
  USING (true);

CREATE POLICY "Deny insert for regular users"
  ON monkeyschool.classes
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny update for regular users"
  ON monkeyschool.classes
  FOR UPDATE
  USING (false);

CREATE POLICY "Deny delete for regular users"
  ON monkeyschool.classes
  FOR DELETE
  USING (false);

-- *** PARENTSTUDENTLINK TABLE ***
-- Drop existing policies on parentstudentlink table
DROP POLICY IF EXISTS "Enable read access for all users" ON monkeyschool.parentstudentlink;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON monkeyschool.parentstudentlink;
DROP POLICY IF EXISTS "Enable update for users based on id" ON monkeyschool.parentstudentlink;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON monkeyschool.parentstudentlink;

-- Create new policies for parentstudentlink table
CREATE POLICY "Allow read access for all users"
  ON monkeyschool.parentstudentlink
  FOR SELECT
  USING (true);

CREATE POLICY "Deny insert for regular users"
  ON monkeyschool.parentstudentlink
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny update for regular users"
  ON monkeyschool.parentstudentlink
  FOR UPDATE
  USING (false);

CREATE POLICY "Deny delete for regular users"
  ON monkeyschool.parentstudentlink
  FOR DELETE
  USING (false);

-- *** SCHOOLS TABLE ***
-- Drop existing policies on schools table
DROP POLICY IF EXISTS "Enable read access for all users" ON monkeyschool.schools;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON monkeyschool.schools;
DROP POLICY IF EXISTS "Enable update for users based on id" ON monkeyschool.schools;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON monkeyschool.schools;

-- Create new policies for schools table
CREATE POLICY "Allow read access for all users"
  ON monkeyschool.schools
  FOR SELECT
  USING (true);

CREATE POLICY "Deny insert for regular users"
  ON monkeyschool.schools
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny update for regular users"
  ON monkeyschool.schools
  FOR UPDATE
  USING (false);

CREATE POLICY "Deny delete for regular users"
  ON monkeyschool.schools
  FOR DELETE
  USING (false);

-- *** SLIDESHOWIMAGES TABLE ***
-- Drop existing policies on slideshowimages table
DROP POLICY IF EXISTS "Enable read access for all users" ON monkeyschool.slideshowimages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON monkeyschool.slideshowimages;
DROP POLICY IF EXISTS "Enable update for users based on id" ON monkeyschool.slideshowimages;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON monkeyschool.slideshowimages;

-- Create new policies for slideshowimages table
CREATE POLICY "Allow read access for all users"
  ON monkeyschool.slideshowimages
  FOR SELECT
  USING (true);

CREATE POLICY "Deny insert for regular users"
  ON monkeyschool.slideshowimages
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny update for regular users"
  ON monkeyschool.slideshowimages
  FOR UPDATE
  USING (false);

CREATE POLICY "Deny delete for regular users"
  ON monkeyschool.slideshowimages
  FOR DELETE
  USING (false);

-- *** WEBPAGEPARTS TABLE ***
-- Drop existing policies on webpageparts table
DROP POLICY IF EXISTS "Enable read access for all users" ON monkeyschool.webpageparts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON monkeyschool.webpageparts;
DROP POLICY IF EXISTS "Enable update for users based on id" ON monkeyschool.webpageparts;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON monkeyschool.webpageparts;

-- Create new policies for webpageparts table
CREATE POLICY "Allow read access for all users"
  ON monkeyschool.webpageparts
  FOR SELECT
  USING (true);

CREATE POLICY "Deny insert for regular users"
  ON monkeyschool.webpageparts
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny update for regular users"
  ON monkeyschool.webpageparts
  FOR UPDATE
  USING (false);

CREATE POLICY "Deny delete for regular users"
  ON monkeyschool.webpageparts
  FOR DELETE
  USING (false);

-- *** WEBPAGES TABLE ***
-- Drop existing policies on webpages table
DROP POLICY IF EXISTS "Enable read access for all users" ON monkeyschool.webpages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON monkeyschool.webpages;
DROP POLICY IF EXISTS "Enable update for users based on id" ON monkeyschool.webpages;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON monkeyschool.webpages;

-- Create new policies for webpages table
CREATE POLICY "Allow read access for all users"
  ON monkeyschool.webpages
  FOR SELECT
  USING (true);

CREATE POLICY "Deny insert for regular users"
  ON monkeyschool.webpages
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny update for regular users"
  ON monkeyschool.webpages
  FOR UPDATE
  USING (false);

CREATE POLICY "Deny delete for regular users"
  ON monkeyschool.webpages
  FOR DELETE
  USING (false);

-- *** YEARS TABLE ***
-- Drop existing policies on years table
DROP POLICY IF EXISTS "Enable read access for all users" ON monkeyschool.years;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON monkeyschool.years;
DROP POLICY IF EXISTS "Enable update for users based on id" ON monkeyschool.years;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON monkeyschool.years;

-- Create new policies for years table
CREATE POLICY "Allow read access for all users"
  ON monkeyschool.years
  FOR SELECT
  USING (true);

CREATE POLICY "Deny insert for regular users"
  ON monkeyschool.years
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny update for regular users"
  ON monkeyschool.years
  FOR UPDATE
  USING (false);

CREATE POLICY "Deny delete for regular users"
  ON monkeyschool.years
  FOR DELETE
  USING (false);

COMMIT;
