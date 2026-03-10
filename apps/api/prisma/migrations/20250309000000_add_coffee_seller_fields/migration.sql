-- AlterTable
ALTER TABLE "seller_profiles" ADD COLUMN "beans" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "seller_profiles" ADD COLUMN "drink_types" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "seller_profiles" ADD COLUMN "machine_type" TEXT;

ALTER TABLE "seller_profiles" ADD COLUMN "opening_hours" TEXT;
