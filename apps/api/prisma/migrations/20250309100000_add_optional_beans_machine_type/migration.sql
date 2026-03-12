-- AlterTable
-- Add optional coffee fields. Existing rows get: beans = [], machine_type = NULL.
-- No tables or data are dropped. Safe for existing seller_profiles.
ALTER TABLE "seller_profiles" ADD COLUMN IF NOT EXISTS "beans" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "seller_profiles" ADD COLUMN IF NOT EXISTS "machine_type" TEXT;
