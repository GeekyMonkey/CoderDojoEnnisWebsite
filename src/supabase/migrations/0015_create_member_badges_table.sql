CREATE TABLE IF NOT EXISTS coderdojo.member_badges (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES coderdojo.members(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES coderdojo.badges(id) ON DELETE CASCADE,
    awarded_by_adult_id UUID REFERENCES coderdojo.members(id) ON DELETE SET NULL,
    application_notes TEXT,
    awarded_notes TEXT,
    rejected_by_adult_id UUID REFERENCES coderdojo.members(id) ON DELETE SET NULL,
    rejected_notes TEXT,
    application_date TIMESTAMP,
    awarded TIMESTAMP,
    rejected_date TIMESTAMP,
    goal_date TIMESTAMP
);
