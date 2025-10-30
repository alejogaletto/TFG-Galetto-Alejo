-- Make password column nullable to support OAuth users
-- OAuth users authenticate through their provider and don't need a password

ALTER TABLE "User" 
ALTER COLUMN "password" DROP NOT NULL;

-- Add a comment to document this change
COMMENT ON COLUMN "User"."password" IS 'Password hash for email/password auth. NULL for OAuth users.';

