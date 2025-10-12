import { School } from "@prisma/client";
import prisma from "./db";

export async function getSchoolById(id: number): Promise<School | null> {
  return prisma.school.findUnique({ where: { id } });
}

export async function getSchools(): Promise<School[]> {
  return prisma.school.findMany();
}
