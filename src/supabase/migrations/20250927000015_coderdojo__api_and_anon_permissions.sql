-- Grant full rights to API user (authenticated) on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA coderdojo TO authenticated;

-- Grant read (SELECT) rights to anon user on all tables
GRANT SELECT ON ALL TABLES IN SCHEMA coderdojo TO anon;

-- Ensure future tables get these privileges automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA coderdojo
  GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA coderdojo
  GRANT SELECT ON TABLES TO anon;
