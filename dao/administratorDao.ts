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

export async function createAdministrator(data: {
  username: string;
  passwordHash: string;
  schoolId: number;
}) {
  const { username, passwordHash, schoolId } = data;
  return prisma.administrator.create({
    data: { username, passwordHash, schoolId },
  });
}

export async function updateAdministrator(
  id: number,
  data: { username?: string; passwordHash?: string }
) {
  return prisma.administrator.update({ where: { id }, data });
}

export async function deleteAdministrator(id: number) {
  return prisma.administrator.delete({ where: { id } });
}
