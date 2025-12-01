/*
  Warnings:

  - You are about to drop the column `teacher_id` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the `group_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teacher_subject_specializations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `group_id` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."group_sessions" DROP CONSTRAINT "group_sessions_group_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."group_sessions" DROP CONSTRAINT "group_sessions_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_subject_specializations" DROP CONSTRAINT "teacher_subject_specializations_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_subject_specializations" DROP CONSTRAINT "teacher_subject_specializations_teacher_id_fkey";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "teacher_id",
ADD COLUMN     "group_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."group_sessions";

-- DropTable
DROP TABLE "public"."teacher_subject_specializations";

-- CreateTable
CREATE TABLE "teacher_subject" (
    "teacher_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,

    CONSTRAINT "teacher_subject_pkey" PRIMARY KEY ("teacher_id","subject_id")
);

-- AddForeignKey
ALTER TABLE "teacher_subject" ADD CONSTRAINT "teacher_subject_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject" ADD CONSTRAINT "teacher_subject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
