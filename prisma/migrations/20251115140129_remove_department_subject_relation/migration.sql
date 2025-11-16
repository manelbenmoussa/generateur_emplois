/*
  Warnings:

  - You are about to drop the column `department_id` on the `Subject` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Subject" DROP CONSTRAINT "Subject_department_id_fkey";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "department_id";
