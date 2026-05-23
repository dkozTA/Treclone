-- AlterTable
ALTER TABLE "users" ADD COLUMN "email_notifications" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "dark_mode" BOOLEAN NOT NULL DEFAULT false;
