import { Specialization } from "@prisma/client";
import prisma from "./db";

export async function getSpecializationsBySchool(
  schoolId: number
): Promise<Specialization[]> {
  // Specializations belong to Department, which belongs to School
  return prisma.specialization.findMany({
    where: {
      department: {
        schoolId,
      },
    },
  });
}

export async function getSpecializationById(
  id: number
): Promise<Specialization | null> {
  return prisma.specialization.findUnique({ where: { id } });
}

export async function createSpecialization(data: {
  name: string;
  departmentId: number;
}) {
  return prisma.specialization.create({ data });
}

export async function updateSpecialization(
  id: number,
  data: {
    name?: string;
    departmentId?: number;
  }
) {
  return prisma.specialization.update({ where: { id }, data });
}

export async function deleteSpecialization(id: number) {
  return prisma.specialization.delete({ where: { id } });
}
