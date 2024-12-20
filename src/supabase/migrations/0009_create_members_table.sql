CREATE TABLE IF NOT EXISTS coderdojo.members (
    id UUID PRIMARY KEY,
    birth_year INT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    email TEXT,
    fingerprint_id INT,
    garda_vetted BOOLEAN NOT NULL DEFAULT FALSE,
    github_login TEXT,
    goal_long_term TEXT,
    goal_short_term TEXT,
    is_mentor BOOLEAN NOT NULL DEFAULT FALSE,
    is_ninja BOOLEAN NOT NULL DEFAULT FALSE,
    is_parent BOOLEAN NOT NULL DEFAULT FALSE,
    login TEXT,
    login_date TIMESTAMP,
    login_date_previous TIMESTAMP,
    name_first TEXT,
    name_last TEXT,
    password_hash TEXT,
    phone TEXT,
    registered_current_term BOOLEAN NOT NULL DEFAULT FALSE,
    scratch_name TEXT,
    team_id UUID REFERENCES coderdojo.teams(id) ON DELETE SET NULL,
    xbox_gamertag TEXT
);
