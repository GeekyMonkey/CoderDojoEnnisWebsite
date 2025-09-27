CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set default for coderdojo.teams.id
ALTER TABLE coderdojo.teams
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Set default for coderdojo.badge_categories.id
ALTER TABLE coderdojo.badge_categories
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Set default for coderdojo.badges.id
ALTER TABLE coderdojo.badges
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Set default for coderdojo.belts.id
ALTER TABLE coderdojo.belts
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Set default for coderdojo.members.id
ALTER TABLE coderdojo.members
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Set default for coderdojo.sessions.id
ALTER TABLE coderdojo.sessions
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Set default for coderdojo.member_attendances.id
ALTER TABLE coderdojo.member_attendances
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Set default for coderdojo.member_badge_categories.id
ALTER TABLE coderdojo.member_badge_categories
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Set default for coderdojo.member_parents.id
ALTER TABLE coderdojo.member_parents
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Set default for coderdojo.member_belts.id
ALTER TABLE coderdojo.member_belts
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Set default for coderdojo.member_badges.id
ALTER TABLE coderdojo.member_badges
    ALTER COLUMN id SET DEFAULT gen_random_uuid();