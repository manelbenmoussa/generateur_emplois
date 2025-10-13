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
