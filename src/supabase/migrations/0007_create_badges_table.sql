DROP TABLE IF EXISTS coderdojo.badges;

CREATE TABLE IF NOT EXISTS coderdojo.badges (
    id UUID PRIMARY KEY,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    achievement TEXT,
    badge_category_id UUID REFERENCES coderdojo.badge_categories(id) ON DELETE SET NULL,
    description TEXT
);
