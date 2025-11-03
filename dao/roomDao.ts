import { Room } from "@prisma/client";
import prisma from "./db";

export async function getRoomsBySchool(schoolId: number): Promise<Room[]> {
  return prisma.room.findMany({ where: { schoolId } });
}

export async function getRoomById(id: number): Promise<Room | null> {
  return prisma.room.findUnique({ where: { id } });
}

export async function createRoom(data: {
  name: string;
  capacity: number;
  schoolId: number;
  departmentId: number;
}): Promise<Room> {
  return prisma.room.create({
    data,
  });
}

export async function updateRoom(
  id: number,
  data: {
    name?: string;
    capacity?: number;
    schoolId?: number;
    departmentId?: number;
  }
): Promise<Room> {
  return prisma.room.update({
    where: { id },
    data,
  });
}

export async function deleteRoom(id: number): Promise<Room> {
  return prisma.room.delete({ where: { id } });
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
