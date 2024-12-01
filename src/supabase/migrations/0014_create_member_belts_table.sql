CREATE TABLE IF NOT EXISTS coderdojo.member_belts (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES coderdojo.members(id) ON DELETE CASCADE,
    belt_id UUID REFERENCES coderdojo.belts(id) ON DELETE CASCADE,
    awarded_by_adult_id UUID REFERENCES coderdojo.members(id) ON DELETE SET NULL,
    application_notes TEXT,
    awarded_notes TEXT,
    rejected_by_adult_id UUID REFERENCES coderdojo.members(id) ON DELETE SET NULL,
    rejected_notes TEXT,
    application_date TIMESTAMP,
    awarded TIMESTAMP,
    rejected_date TIMESTAMP
);
