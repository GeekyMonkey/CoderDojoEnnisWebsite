CREATE TABLE IF NOT EXISTS coderdojo.member_attendances (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES coderdojo.members(id) ON DELETE CASCADE,
    date DATE
);

CREATE INDEX IF NOT EXISTS member_attendances_date_idx ON coderdojo.member_attendances ("date");
