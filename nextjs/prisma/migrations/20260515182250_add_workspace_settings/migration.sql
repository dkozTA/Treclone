-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "daily_summary" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mention_alerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'private';
