import prisma from "./db";
import type { Session } from "../types/entities";

export async function getSessionsBySchool(
  schoolId: number
): Promise<Session[]> {
  // sessions are linked to groups/teachers/subjects which are linked to a school
  return (await prisma.session.findMany({
    where: { group: { is: { schoolId } } },
    include: { teacher: true, subject: true, group: true },
  })) as unknown as Session[];
}

export async function getSessionsByTeacher(
  teacherId: number
): Promise<Session[]> {
  return (await prisma.session.findMany({
    where: { teacherId },
    include: { subject: true, group: true },
  })) as unknown as Session[];
}
