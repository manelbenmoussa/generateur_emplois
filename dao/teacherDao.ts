import type { Prisma } from "@prisma/client";
import prisma from "./db";

// Use the generated Prisma payload type for the included join relation.
export type TeacherWithSpecializations = Prisma.TeacherGetPayload<{
  include: { expertSubjects: true };
}>;

export async function getTeachersBySchool(
  schoolId: number
): Promise<TeacherWithSpecializations[]> {
  return prisma.teacher.findMany({
    where: { schoolId },
    include: { expertSubjects: true },
  });
}


export async function getTeacherById(
  id: number
): Promise<TeacherWithSpecializations | null> {
  return prisma.teacher.findUnique({
    where: { id },
    include: { expertSubjects: true },
  });
}

