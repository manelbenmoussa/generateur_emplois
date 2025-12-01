import { Group } from "@prisma/client";
import prisma from "./db";

export async function getGroupsBySchool(schoolId: number): Promise<Group[]> {
  // Groups belong to Specialization, which belongs to Department, which belongs to School
  return prisma.group.findMany({
    where: {
      specialization: {
        department: {
          schoolId,
        },
      },
    },
  });
}

export async function getGroupById(id: number): Promise<Group | null> {
  return prisma.group.findUnique({ where: { id } });
}
