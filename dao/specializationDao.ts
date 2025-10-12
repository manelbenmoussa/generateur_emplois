import { Specialization } from "@prisma/client";
import prisma from "./db";

export async function getSpecializationsBySchool(
  schoolId: number
): Promise<Specialization[]> {
  return prisma.specialization.findMany({ where: { schoolId } });
}

export async function getSpecializationById(
  id: number
): Promise<Specialization | null> {
  return prisma.specialization.findUnique({ where: { id } });
}
