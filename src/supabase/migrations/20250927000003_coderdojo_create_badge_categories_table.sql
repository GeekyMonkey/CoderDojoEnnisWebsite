CREATE TABLE IF NOT EXISTS coderdojo.badge_categories (
    id UUID PRIMARY KEY,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    category_name TEXT,
    category_description TEXT
);
