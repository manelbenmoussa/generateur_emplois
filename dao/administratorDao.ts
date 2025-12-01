import { Administrator } from "@prisma/client";
import prisma from "./db";

export async function getAdministratorsBySchool(
  schoolId: number
): Promise<Administrator[]> {
  return prisma.administrator.findMany({
    where: { schoolId },
    include: {
      user: true,
      school: true,
    },
  });
}

export async function getAdministratorById(
  id: number
): Promise<Administrator | null> {
  return prisma.administrator.findUnique({
    where: { id },
    include: {
      user: true,
      school: true,
    },
  });
}

export async function createAdministrator(data: {
  userId: string;
  schoolId: number;
}) {
  const { userId, schoolId } = data;
  return prisma.administrator.create({
    data: { userId, schoolId },
    include: {
      user: true,
      school: true,
    },
  });
}

export async function updateAdministrator(
  id: number,
  data: { schoolId?: number }
) {
  return prisma.administrator.update({
    where: { id },
    data,
    include: {
      user: true,
      school: true,
    },
  });
}

export async function deleteAdministrator(id: number) {
  return prisma.administrator.delete({ where: { id } });
}
