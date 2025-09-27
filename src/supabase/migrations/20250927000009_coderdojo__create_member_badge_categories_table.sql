CREATE TABLE IF NOT EXISTS coderdojo.member_badge_categories (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES coderdojo.members(id) ON DELETE CASCADE,
    badge_category_id UUID REFERENCES coderdojo.badge_categories(id) ON DELETE CASCADE
);
