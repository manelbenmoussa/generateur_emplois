import { Department } from "@prisma/client";
import prisma from "./db";

export async function getDepartmentsBySchool(
  schoolId: number
): Promise<Department[]> {
  return prisma.department.findMany({ where: { schoolId } });
}

export async function getDepartmentById(
  id: number
): Promise<Department | null> {
  return prisma.department.findUnique({
    where: { id },
  });
}
