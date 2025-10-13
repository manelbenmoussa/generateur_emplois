/*
  Warnings:

  - You are about to drop the column `school_id` on the `Specialization` table. All the data in the column will be lost.
  - You are about to drop the column `school_id` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `group` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `department_id` to the `Specialization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department_id` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Room" DROP CONSTRAINT "Room_school_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_group_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Specialization" DROP CONSTRAINT "Specialization_school_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Subject" DROP CONSTRAINT "Subject_school_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."group" DROP CONSTRAINT "group_department_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."group" DROP CONSTRAINT "group_school_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."group" DROP CONSTRAINT "group_specialization_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_subject_specializations" DROP CONSTRAINT "teacher_subject_specializations_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_subject_specializations" DROP CONSTRAINT "teacher_subject_specializations_teacher_id_fkey";

-- AlterTable
ALTER TABLE "Specialization" DROP COLUMN "school_id",
ADD COLUMN     "department_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "school_id",
ADD COLUMN     "department_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Room";

-- DropTable
DROP TABLE "public"."Session";

-- DropTable
DROP TABLE "public"."group";

-- CreateTable
CREATE TABLE "subject_specializations" (
    "subject_id" INTEGER NOT NULL,
    "specialization_id" INTEGER NOT NULL,

    CONSTRAINT "subject_specializations_pkey" PRIMARY KEY ("subject_id","specialization_id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" SERIAL NOT NULL,
    "level" TEXT,
    "specialization_id" INTEGER NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "teacher_id" INTEGER,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_sessions" (
    "group_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,

    CONSTRAINT "group_sessions_pkey" PRIMARY KEY ("group_id","session_id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "capacity" INTEGER,
    "school_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_specializations" ADD CONSTRAINT "teacher_subject_specializations_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_specializations" ADD CONSTRAINT "teacher_subject_specializations_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialization" ADD CONSTRAINT "Specialization_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_specializations" ADD CONSTRAINT "subject_specializations_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_specializations" ADD CONSTRAINT "subject_specializations_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "Specialization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "Specialization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_sessions" ADD CONSTRAINT "group_sessions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_sessions" ADD CONSTRAINT "group_sessions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
