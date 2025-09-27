CREATE SCHEMA IF NOT EXISTS monkeyschool;

-- Alter default privileges for the postgres user
ALTER DEFAULT PRIVILEGES FOR USER postgres
  IN SCHEMA monkeyschool GRANT ALL
  ON SEQUENCES TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR USER postgres
  IN SCHEMA monkeyschool GRANT ALL
  ON TABLES TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR USER postgres
  IN SCHEMA monkeyschool GRANT ALL
  ON FUNCTIONS TO postgres, anon, authenticated, service_role;

GRANT ALL PRIVILEGES ON SCHEMA monkeyschool TO postgres;
GRANT USAGE ON SCHEMA monkeyschool
  TO postgres, anon, authenticated, service_role;

-- Create tables
CREATE TABLE monkeyschool.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  domains TEXT[] DEFAULT '{}',
  school_name JSON DEFAULT '{}',
  languages TEXT[] DEFAULT '{"en"}'
);

CREATE TABLE monkeyschool.webPages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type TEXT,
  title JSON,
  owner_id UUID,
  nav_parent_id UUID,
  url TEXT,
  heading JSON,
  school_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  sort_subpages_desc BOOLEAN DEFAULT false
);

CREATE TABLE monkeyschool.webPageParts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webpage_id UUID REFERENCES monkeyschool.webPages(id) ON DELETE CASCADE,
  sort_order SMALLINT,
  subheading JSON,
  text JSON,
  part_type TEXT,
  image_position TEXT,
  image_width SMALLINT,
  image_height SMALLINT
);

CREATE TABLE monkeyschool.slideshowImages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT,
  owner_id UUID,
  file_name TEXT,
  sort_order SMALLINT DEFAULT 9999,
  ext TEXT,
  aspect_ratio REAL DEFAULT 1,
  original_width SMALLINT DEFAULT 100,
  original_height SMALLINT DEFAULT 100
);

CREATE TABLE monkeyschool.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name JSON DEFAULT '{}',
  sort_order SMALLINT DEFAULT 9999,
  active BOOLEAN DEFAULT true,
  school_id UUID REFERENCES monkeyschool.schools(id) ON DELETE CASCADE
);

CREATE TABLE monkeyschool.years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_name JSON DEFAULT '{}',
  sort_order SMALLINT DEFAULT 9999,
  active BOOLEAN DEFAULT true,
  school_id UUID REFERENCES monkeyschool.schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES monkeyschool.classes(id)
);

CREATE TABLE monkeyschool.parentStudentLink (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID,
  student_id UUID
);

CREATE TABLE monkeyschool.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  updated TIMESTAMP,
  user_name TEXT,
  email TEXT,
  password TEXT,
  phone_home TEXT,
  phone_mobile TEXT,
  phone_work TEXT,
  address TEXT,
  school_board BOOLEAN DEFAULT false,
  parent BOOLEAN DEFAULT false,
  teacher BOOLEAN DEFAULT false,
  principal BOOLEAN DEFAULT false,
  admin BOOLEAN DEFAULT false,
  student BOOLEAN DEFAULT false,
  bio JSON,
  role TEXT,
  year_id UUID,
  birth_date DATE,
  student_start_year SMALLINT,
  last_login TIMESTAMP,
  previous_login TIMESTAMP,
  school_id UUID
);

GRANT ALL ON ALL TABLES IN SCHEMA monkeyschool TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA monkeyschool TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA monkeyschool TO anon, authenticated, service_role;