DROP TABLE IF EXISTS coderdojo.Teams;

CREATE TABLE IF NOT EXISTS coderdojo.teams (
    id UUID PRIMARY KEY,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    goal TEXT,
    hexCode TEXT,
    notes TEXT,
    team_name TEXT NOT NULL
);
