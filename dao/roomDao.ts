import { Room } from "@prisma/client";
import prisma from "./db";

export async function getRoomsBySchool(schoolId: number): Promise<Room[]> {
  return prisma.room.findMany({ where: { schoolId } });
}

export async function getRoomById(id: number): Promise<Room | null> {
  return prisma.room.findUnique({ where: { id } });
}
