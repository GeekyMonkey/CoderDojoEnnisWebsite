-- Alter default privileges for the postgres user
ALTER DEFAULT PRIVILEGES FOR USER postgres
  IN SCHEMA coderdojo GRANT ALL
  ON SEQUENCES TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR USER postgres
  IN SCHEMA coderdojo GRANT ALL
  ON TABLES TO postgres, anon, authenticated, service_role;
	
ALTER DEFAULT PRIVILEGES FOR USER postgres
  IN SCHEMA coderdojo GRANT ALL
  ON FUNCTIONS TO postgres, anon, authenticated, service_role;

GRANT ALL PRIVILEGES ON SCHEMA coderdojo TO postgres;
GRANT USAGE ON SCHEMA coderdojo
  TO postgres, anon, authenticated, service_role;