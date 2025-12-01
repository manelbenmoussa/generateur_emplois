-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "scheduled_time" TEXT,
ADD COLUMN     "scheduled_weekday" TEXT,
ADD COLUMN     "teacher_id" INTEGER;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
