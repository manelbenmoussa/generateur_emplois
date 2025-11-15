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
    include: {
      department: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getSubjectsByDepartment(
  departmentId: number
): Promise<Subject[]> {
  return prisma.subject.findMany({
    where: { departmentId },
    include: {
      department: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getSubjectById(id: number): Promise<Subject | null> {
  return prisma.subject.findUnique({
    where: { id },
    include: {
      department: true,
    },
  });
}

export async function getSubjectByName(
  name: string,
  departmentId: number
): Promise<Subject | null> {
  return prisma.subject.findFirst({
    where: {
      name,
      departmentId,
    },
  });
}

export async function createSubject(data: {
  name: string;
  hourVolume: number;
  departmentId: number;
}): Promise<Subject> {
  return prisma.subject.create({
    data,
    include: {
      department: true,
    },
  });
}

export async function updateSubject(
  id: number,
  data: {
    name?: string;
    hourVolume?: number;
    departmentId?: number;
  }
): Promise<Subject> {
  return prisma.subject.update({
    where: { id },
    data,
    include: {
      department: true,
    },
  });
}

export async function deleteSubject(id: number): Promise<Subject> {
  return prisma.subject.delete({
    where: { id },
  });
}
