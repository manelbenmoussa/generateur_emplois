/*
  Warnings:

  - You are about to drop the column `room_id` on the `Session` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_room_id_fkey";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "room_id";
