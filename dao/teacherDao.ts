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

export async function createTeacher(data: {
  firstName?: string | null;
  lastName?: string | null;
  schoolId: number;
  expertSubjectIds?: number[];
}) {
  // Create teacher and optionally create expert subject links
  const {
    firstName = null,
    lastName = null,
    schoolId,
    expertSubjectIds,
  } = data;

  const teacher = await prisma.teacher.create({
    data: {
      firstName,
      lastName,
      schoolId,
    },
  });

  if (expertSubjectIds && expertSubjectIds.length > 0) {
    const createMany = expertSubjectIds.map((subjectId) => ({
      teacherId: teacher.id,
      subjectId,
    }));
    // Use createMany on the join table
    await prisma.teacherSubjectSpecialization.createMany({
      data: createMany,
      skipDuplicates: true,
    });
  }

  // Return the created teacher with specializations included
  return getTeacherById(teacher.id);
}

export async function updateTeacher(
  id: number,
  data: {
    firstName?: string | null;
    lastName?: string | null;
    expertSubjectIds?: number[] | null; // null means no change, [] means clear
  }
) {
  const { firstName, lastName, expertSubjectIds } = data;

  // Update teacher basic fields
  await prisma.teacher.update({
    where: { id },
    data: {
      firstName,
      lastName,
    },
  });

  // If expertSubjectIds is provided, sync the join table
  if (expertSubjectIds !== undefined) {
    // Remove existing links
    await prisma.teacherSubjectSpecialization.deleteMany({
      where: { teacherId: id },
    });

    if (expertSubjectIds && expertSubjectIds.length > 0) {
      const createMany = expertSubjectIds.map((subjectId) => ({
        teacherId: id,
        subjectId,
      }));
      await prisma.teacherSubjectSpecialization.createMany({
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
