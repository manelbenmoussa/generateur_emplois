import { Subject } from "@prisma/client";
import prisma from "./db";

export async function getSubjectsBySchool(
  schoolId: number
): Promise<Subject[]> {
  // Subjects are associated to teachers, and teachers are associated to school
  return prisma.subject.findMany({
    where: {
      teachers: {
        some: {
          teacher: {
            schoolId,
          },
        },
      },
    },
  });
}

export async function getSubjectById(id: number): Promise<Subject | null> {
  return prisma.subject.findUnique({ where: { id } });
}
