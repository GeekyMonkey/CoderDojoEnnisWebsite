DROP TABLE IF EXISTS coderdojo.belts;

CREATE TABLE IF NOT EXISTS coderdojo.belts (
    id UUID PRIMARY KEY,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    color TEXT,
    hex_code TEXT,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0
);
