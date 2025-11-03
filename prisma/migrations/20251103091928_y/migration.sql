/*
  Warnings:

  - You are about to drop the `subject_specializations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."subject_specializations" DROP CONSTRAINT "subject_specializations_specialization_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subject_specializations" DROP CONSTRAINT "subject_specializations_subject_id_fkey";

-- DropTable
DROP TABLE "public"."subject_specializations";
