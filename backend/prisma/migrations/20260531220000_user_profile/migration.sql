-- AlterTable
ALTER TABLE "User" ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "addressLine1" TEXT,
ADD COLUMN "addressLine2" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "postalCode" TEXT,
ADD COLUMN "country" TEXT;

-- Backfill first/last name from legacy name field
UPDATE "User"
SET
  "firstName" = NULLIF(split_part(trim("name"), ' ', 1), ''),
  "lastName" = NULLIF(
    trim(substring(trim("name") from length(split_part(trim("name"), ' ', 1)) + 1)),
    ''
  )
WHERE "name" IS NOT NULL AND trim("name") <> '';
