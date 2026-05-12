-- DropForeignKey
ALTER TABLE "boards" DROP CONSTRAINT "boards_workspace_id_fkey";

-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "workspace_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "workspace_id" BIGINT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_members" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "board_id" BIGINT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_templates" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "category" VARCHAR(100) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_lists" (
    "id" BIGSERIAL NOT NULL,
    "template_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_lists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workspace_members_workspace_id_idx" ON "workspace_members"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_user_id_workspace_id_key" ON "workspace_members"("user_id", "workspace_id");

-- CreateIndex
CREATE INDEX "board_members_board_id_idx" ON "board_members"("board_id");

-- CreateIndex
CREATE UNIQUE INDEX "board_members_user_id_board_id_key" ON "board_members"("user_id", "board_id");

-- CreateIndex
CREATE INDEX "template_lists_template_id_idx" ON "template_lists"("template_id");

-- CreateIndex
CREATE INDEX "boards_owner_id_idx" ON "boards"("owner_id");

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_lists" ADD CONSTRAINT "template_lists_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "board_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
