
DELETE FROM coderdojo.sessions;

ALTER TABLE coderdojo.sessions
DROP COLUMN IF EXISTS created_date,
DROP COLUMN IF EXISTS end_date,
DROP COLUMN IF EXISTS url,
DROP COLUMN IF EXISTS adult_id,
DROP COLUMN IF EXISTS adult2_id;

-- Add session_date ensuring it is unique. This automatically creates an index.
ALTER TABLE coderdojo.sessions
ADD COLUMN IF NOT EXISTS session_date DATE NOT NULL UNIQUE;

-- Drop duplicate index
DROP INDEX IF EXISTS coderdojo.member_attendances_date_idx;
