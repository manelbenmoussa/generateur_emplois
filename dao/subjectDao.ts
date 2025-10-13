import { Subject } from "@prisma/client";
import prisma from "./db";

export async function getSubjectsBySchool(
  schoolId: number
): Promise<Subject[]> {
  // Subjects belong to Department, which belongs to School
  return prisma.subject.findMany({
    where: {
      department: {
        schoolId,
      },
    },
  });
}

export async function getSubjectById(id: number): Promise<Subject | null> {
  return prisma.subject.findUnique({ where: { id } });
}
