import { Administrator } from "@prisma/client";
import prisma from "./db";

export async function getAdministratorsBySchool(
  schoolId: number
): Promise<Administrator[]> {
  return prisma.administrator.findMany({ where: { schoolId } });
}

export async function getAdministratorById(
  id: number
): Promise<Administrator | null> {
  return prisma.administrator.findUnique({ where: { id } });
}
