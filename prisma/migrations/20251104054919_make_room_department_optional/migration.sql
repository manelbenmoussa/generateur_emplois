-- DropForeignKey
ALTER TABLE "public"."rooms" DROP CONSTRAINT "rooms_department_id_fkey";

-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "department_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
