-- Enable RLS on all tables
BEGIN;

-- Enable RLS on all tables in monkeyschool schema
ALTER TABLE monkeyschool.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.parentstudentlink ENABLE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.slideshowimages ENABLE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.webpageparts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.webpages ENABLE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.years ENABLE ROW LEVEL SECURITY;

-- Force all tables to require row level security for safety
ALTER TABLE monkeyschool.classes FORCE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.parentstudentlink FORCE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.schools FORCE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.slideshowimages FORCE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.users FORCE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.webpageparts FORCE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.webpages FORCE ROW LEVEL SECURITY;
ALTER TABLE monkeyschool.years FORCE ROW LEVEL SECURITY;

COMMIT;
