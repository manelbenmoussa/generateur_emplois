-- CreateTable
CREATE TABLE "teacher_subject_specializations" (
    "teacher_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,

    CONSTRAINT "teacher_subject_specializations_pkey" PRIMARY KEY ("teacher_id","subject_id")
);

-- AddForeignKey
ALTER TABLE "teacher_subject_specializations" ADD CONSTRAINT "teacher_subject_specializations_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subject_specializations" ADD CONSTRAINT "teacher_subject_specializations_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
