-- Add password_hash column
ALTER TABLE monkeyschool.users 
ADD COLUMN password_hash TEXT;

-- Create a function to generate the password hash
CREATE OR REPLACE FUNCTION monkeyschool.generate_password_hash(
    user_id TEXT,
    password TEXT
) 
RETURNS TEXT AS $$
DECLARE
    salt TEXT;
    hash TEXT;
BEGIN
    -- Create salt using the pattern H@5h: + user_id
    salt := 'H@5h:' || user_id;
    
    -- Generate SHA-256 hash of the lowercase password with the salt
    -- Using pgcrypto's digest function with SHA-256
    SELECT encode(digest(salt || lower(password), 'sha256'), 'hex') INTO hash;
    
    RETURN hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update all existing users with hashed passwords
-- Only update rows where password is not null and password_hash is null
DO $$
BEGIN
    EXECUTE 
        'UPDATE monkeyschool.users 
         SET password_hash = monkeyschool.generate_password_hash(id::text, password)
         WHERE password IS NOT NULL 
         AND password_hash IS NULL';
END $$;

-- Create an index on password_hash for performance
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON monkeyschool.users (password_hash);

-- Add a comment to the column
COMMENT ON COLUMN monkeyschool.users.password_hash IS 'SHA-256 hash of password with salt format: H@5h: + user_id';

-- Keep the function for future use in the application
COMMENT ON FUNCTION monkeyschool.generate_password_hash(TEXT, TEXT) IS 'Generates a SHA-256 hash of the password with a salt format of H@5h: + user_id';

-- Create a function to verify passwords
CREATE OR REPLACE FUNCTION monkeyschool.verify_password(
    user_id TEXT,
    password TEXT,
    hashed_password TEXT
) 
RETURNS BOOLEAN AS $$
DECLARE
    salt TEXT;
    computed_hash TEXT;
BEGIN
    -- Create the same salt that was used for hashing
    salt := 'H@5h:' || user_id;
    
    -- Compute the hash with the lowercase version of the provided password
    SELECT encode(digest(salt || lower(password), 'sha256'), 'hex') INTO computed_hash;
    
    -- Compare the computed hash with the stored hash
    RETURN computed_hash = hashed_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION monkeyschool.verify_password(TEXT, TEXT, TEXT) IS 'Verifies if a password matches the stored hash';

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION monkeyschool.generate_password_hash(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION monkeyschool.verify_password(TEXT, TEXT, TEXT) TO authenticated;