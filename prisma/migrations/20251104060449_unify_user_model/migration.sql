/*
  Warnings:

  - You are about to drop the column `password_hash` on the `Administrator` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Administrator` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Administrator` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Administrator` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Administrator_username_key";

-- AlterTable
ALTER TABLE "Administrator" DROP COLUMN "password_hash",
DROP COLUMN "username",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "first_name",
DROP COLUMN "last_name";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "first_name",
DROP COLUMN "last_name";

-- CreateIndex
CREATE UNIQUE INDEX "Administrator_user_id_key" ON "Administrator"("user_id");

-- AddForeignKey
ALTER TABLE "Administrator" ADD CONSTRAINT "Administrator_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
