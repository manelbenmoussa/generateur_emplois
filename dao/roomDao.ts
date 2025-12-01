import { Room } from "@prisma/client";
import prisma from "./db";

export async function getRoomsBySchool(schoolId: number): Promise<Room[]> {
  return prisma.room.findMany({
    where: { schoolId },
    include: {
      department: true,
      school: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getRoomById(id: number): Promise<Room | null> {
  return prisma.room.findUnique({
    where: { id },
    include: {
      department: true,
      school: true,
    },
  });
}

export async function getRoomByName(
  name: string,
  schoolId: number
): Promise<Room | null> {
  return prisma.room.findFirst({
    where: {
      name,
      schoolId,
    },
  });
}

export async function createRoom(data: {
  name: string;
  capacity: number;
  schoolId: number;
  departmentId: number | null;
}): Promise<Room> {
  return prisma.room.create({
    data,
    include: {
      department: true,
      school: true,
    },
  });
}

export async function updateRoom(
  id: number,
  data: {
    name?: string;
    capacity?: number;
    schoolId?: number;
    departmentId?: number | null;
  }
): Promise<Room> {
  return prisma.room.update({
    where: { id },
    data,
    include: {
      department: true,
      school: true,
    },
  });
}

export async function deleteRoom(id: number): Promise<Room> {
  return prisma.room.delete({
    where: { id },
  });
}
