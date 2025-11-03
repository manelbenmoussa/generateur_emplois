import type { Prisma } from "@prisma/client";
import prisma from "./db";

// Use the generated Prisma payload type for the included join relation.
export type TeacherWithSubjects = Prisma.TeacherGetPayload<{
  include: { subjects: true; user: true };
}>;

/**
 * Get teachers by school with their subjects and user account
 */
export async function getTeachersBySchool(
  schoolId: number
): Promise<TeacherWithSubjects[]> {
  return prisma.teacher.findMany({
    where: { schoolId },
    include: {
      subjects: true,
      user: true,
    },
  });
}

/**
 * Get teacher by ID with subjects and user account
 */
export async function getTeacherById(
  id: number
): Promise<TeacherWithSubjects | null> {
  return prisma.teacher.findUnique({
    where: { id },
    include: {
      subjects: true,
      user: true,
    },
  });
}

/**
 * Create a teacher profile linked to a User account
 * @param userId - The User ID to link this teacher profile to
 */
export async function createTeacher(data: {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  schoolId: number;
  subjectIds?: number[];
}) {
  // Create teacher and optionally create subject links
  const {
    userId,
    firstName = null,
    lastName = null,
    schoolId,
    subjectIds,
  } = data;

  const teacher = await prisma.teacher.create({
    data: {
      userId,
      firstName,
      lastName,
      schoolId,
    },
  });

  if (subjectIds && subjectIds.length > 0) {
    const createMany = subjectIds.map((subjectId) => ({
      teacherId: teacher.id,
      subjectId,
    }));
    // Use createMany on the join table
    await prisma.teacherSubject.createMany({
      data: createMany,
      skipDuplicates: true,
    });
  }

  // Return the created teacher with subjects included
  return getTeacherById(teacher.id);
}

export async function updateTeacher(
  id: number,
  data: {
    firstName?: string | null;
    lastName?: string | null;
    subjectIds?: number[] | null; // null means no change, [] means clear
  }
) {
  const { firstName, lastName, subjectIds } = data;

  // Update teacher basic fields
  await prisma.teacher.update({
    where: { id },
    data: {
      firstName,
      lastName,
    },
  });

  // If subjectIds is provided, sync the join table
  if (subjectIds !== undefined) {
    // Remove existing links
    await prisma.teacherSubject.deleteMany({
      where: { teacherId: id },
    });

    if (subjectIds && subjectIds.length > 0) {
      const createMany = subjectIds.map((subjectId) => ({
        teacherId: id,
        subjectId,
      }));
      await prisma.teacherSubject.createMany({
        data: createMany,
        skipDuplicates: true,
      });
    }
  }

  return getTeacherById(id);
}

export async function deleteTeacher(id: number) {
  // Deleting teacher will cascade on join table per schema, but be explicit if needed
  return prisma.teacher.delete({ where: { id } });
}
