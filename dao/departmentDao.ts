import { Department } from "@prisma/client";
import prisma from "./db";

export async function getDepartmentsBySchool(
  schoolId: number
): Promise<Department[]> {
  return prisma.department.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });
}

export async function getDepartmentById(
  id: number
): Promise<Department | null> {
  return prisma.department.findUnique({
    where: { id },
  });
}

export async function getDepartmentByName(
  name: string,
  schoolId: number
): Promise<Department | null> {
  return prisma.department.findFirst({
    where: {
      name,
      schoolId,
    },
  });
}

export async function createDepartment(data: {
  name: string;
  schoolId: number;
}): Promise<Department> {
  return prisma.department.create({
    data,
  });
}

export async function updateDepartment(
  id: number,
  data: {
    name: string;
  }
): Promise<Department> {
  return prisma.department.update({
    where: { id },
    data,
  });
}

export async function deleteDepartment(id: number): Promise<void> {
  // First, set departmentId to null for all rooms in this department
  await prisma.room.updateMany({
    where: { departmentId: id },
    data: { departmentId: null },
  });

  // Then delete the department
  await prisma.department.delete({
    where: { id },
  });
}
