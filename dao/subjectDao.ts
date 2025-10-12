import { Subject } from "@prisma/client";
import prisma from "./db";

export async function getSubjectsBySchool(
  schoolId: number
): Promise<Subject[]> {
  return prisma.subject.findMany({ where: { schoolId } });
}

export async function getSubjectById(id: number): Promise<Subject | null> {
  return prisma.subject.findUnique({ where: { id } });
}
