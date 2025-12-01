import prisma from "./db";

export async function getScheduleConfigBySchool(schoolId: number) {
  return prisma.scheduleConfig.findUnique({
    where: { schoolId },
  });
}

export async function upsertScheduleConfigBySchool(
  schoolId: number,
  days: string,
  timeSlots: string
) {
  return prisma.scheduleConfig.upsert({
    where: { schoolId },
    update: {
      days,
      timeSlots,
    },
    create: {
      schoolId,
      days,
      timeSlots,
    },
  });
}
