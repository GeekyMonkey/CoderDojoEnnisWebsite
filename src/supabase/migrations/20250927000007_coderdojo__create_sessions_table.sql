CREATE TABLE IF NOT EXISTS coderdojo.sessions (
    id UUID PRIMARY KEY,
    created_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP,
    url TEXT,
    topic TEXT,
    adult_id UUID REFERENCES coderdojo.members(id) ON DELETE SET NULL,
    adult2_id UUID REFERENCES coderdojo.members(id) ON DELETE SET NULL,
    mentors_only BOOLEAN NOT NULL DEFAULT FALSE
);
