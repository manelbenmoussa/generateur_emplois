/*
  Warnings:

  - You are about to drop the column `department_id` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the `absences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exam_grades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exams` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `swap_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Subject" DROP CONSTRAINT "Subject_department_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."absences" DROP CONSTRAINT "absences_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."absences" DROP CONSTRAINT "absences_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exam_grades" DROP CONSTRAINT "exam_grades_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exam_grades" DROP CONSTRAINT "exam_grades_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exams" DROP CONSTRAINT "exams_group_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exams" DROP CONSTRAINT "exams_room_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exams" DROP CONSTRAINT "exams_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."swap_requests" DROP CONSTRAINT "swap_requests_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."swap_requests" DROP CONSTRAINT "swap_requests_student_id_fkey";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "department_id";

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "maxWeeklyHours" DOUBLE PRECISION;

-- DropTable
DROP TABLE "public"."absences";

-- DropTable
DROP TABLE "public"."exam_grades";

-- DropTable
DROP TABLE "public"."exams";

-- DropTable
DROP TABLE "public"."messages";

-- DropTable
DROP TABLE "public"."payments";

-- DropTable
DROP TABLE "public"."swap_requests";

-- CreateTable
CREATE TABLE "ScheduleConfig" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "days" TEXT NOT NULL,
    "timeSlots" TEXT NOT NULL,

    CONSTRAINT "ScheduleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleConfig_schoolId_key" ON "ScheduleConfig"("schoolId");

-- AddForeignKey
ALTER TABLE "ScheduleConfig" ADD CONSTRAINT "ScheduleConfig_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
