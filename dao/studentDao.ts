import type { Prisma } from "@prisma/client";
import prisma from "./db";

// Student with user account
export type StudentWithUser = Prisma.StudentGetPayload<{
  include: { user: true; group: true };
}>;

/**
 * Get students by school with their user account
 */
export async function getStudentsBySchool(
  schoolId: number
): Promise<StudentWithUser[]> {
  return prisma.student.findMany({
    where: { schoolId },
    include: {
      user: true,
      group: true,
    },
  });
}

/**
 * Get student by ID with user account
 */
export async function getStudentById(
  id: number
): Promise<StudentWithUser | null> {
  return prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      group: true,
    },
  });
}

/**
 * Create a student profile linked to a User account
 * @param userId - The User ID to link this student profile to
 */
export async function createStudent(data: {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  schoolId: number;
  groupId?: number | null;
}) {
  const {
    userId,
    firstName = null,
    lastName = null,
    schoolId,
    groupId = null,
  } = data;
  return prisma.student.create({
    data: {
      userId,
      firstName,
      lastName,
      schoolId,
      groupId,
    },
    include: {
      user: true,
      group: true,
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
