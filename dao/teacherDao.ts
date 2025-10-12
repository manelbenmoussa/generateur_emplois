import { Teacher } from "@prisma/client";
import prisma from "./db";

export async function getTeachersBySchool(
  schoolId: number
): Promise<Teacher[]> {
  return prisma.teacher.findMany({ where: { schoolId } });
}

export async function getTeacherById(id: number): Promise<Teacher | null> {
  return prisma.teacher.findUnique({ where: { id } });
}
