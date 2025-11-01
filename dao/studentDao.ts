import { Student } from "@prisma/client";
import prisma from "./db";

export async function getStudentsBySchool(
  schoolId: number
): Promise<Student[]> {
  return prisma.student.findMany({ where: { schoolId } });
}

export async function getStudentById(id: number): Promise<Student | null> {
  return prisma.student.findUnique({ where: { id } });
}

export async function createStudent(data: {
  firstName?: string | null;
  lastName?: string | null;
  schoolId: number;
  groupId?: number | null;
}) {
  const { firstName = null, lastName = null, schoolId, groupId = null } = data;
  return prisma.student.create({
    data: {
      firstName,
      lastName,
      schoolId,
      groupId,
    },
  });
}

export async function updateStudent(
  id: number,
  data: {
    firstName?: string | null;
    lastName?: string | null;
    groupId?: number | null;
  }
) {
  return prisma.student.update({ where: { id }, data });
}

export async function deleteStudent(id: number) {
  return prisma.student.delete({ where: { id } });
}
