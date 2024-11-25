CREATE TABLE IF NOT EXISTS coderdojo.member_parents (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES coderdojo.members(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES coderdojo.members(id) ON DELETE CASCADE
);
