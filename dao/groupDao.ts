import { Group } from "@prisma/client";
import prisma from "./db";

export async function getGroupsBySchool(schoolId: number): Promise<Group[]> {
  return prisma.group.findMany({ where: { schoolId } });
}

export async function getGroupById(id: number): Promise<Group | null> {
  return prisma.group.findUnique({ where: { id } });
}
