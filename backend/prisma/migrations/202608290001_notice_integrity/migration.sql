-- Convert legacy notice target values to a constrained PostgreSQL enum.
DO $$ BEGIN
  CREATE TYPE "NoticeTargetRole" AS ENUM ('all', 'student', 'faculty', 'hod', 'admin', 'finance_officer', 'librarian', 'management');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Notice"
  ALTER COLUMN "targetRole" DROP DEFAULT,
  ALTER COLUMN "targetRole" TYPE "NoticeTargetRole"
    USING (CASE
      WHEN "targetRole" IN ('student', 'faculty', 'hod', 'admin', 'finance_officer', 'librarian', 'management') THEN "targetRole"
      ELSE 'all'
    END)::"NoticeTargetRole",
  ALTER COLUMN "targetRole" SET DEFAULT 'all';

-- Legacy seed data used display names in this column. They are not valid User IDs.
UPDATE "Notice" n
SET "publishedBy" = NULL
WHERE "publishedBy" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "User" u WHERE u."id" = n."publishedBy");

ALTER TABLE "Notice"
  ADD CONSTRAINT "Notice_publishedBy_fkey"
  FOREIGN KEY ("publishedBy") REFERENCES "User"("id")
  ON UPDATE CASCADE ON DELETE SET NULL;

