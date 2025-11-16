import prisma from "./db";

export async function getSessionsBySchool(schoolId: number) {
  // Sessions are linked to teachers, and teachers are associated to school
  // Also linked to a single group directly
  // We still return subject, group and teacher.user for UI consumption.
  return await prisma.session.findMany({
    where: {
      teacher: {
        schoolId,
      },
    },
    include: {
      subject: true,
      group: true,
      teacher: {
        include: {
          user: true,
        },
      },
    },
  });
}

// --- CRUD ---
export type SessionInput = {
  subjectId: number;
  groupId: number;
  teacherId: number;
  scheduled_weekday?: string | null;
  scheduled_time?: string | null;
};

export async function createSession(data: SessionInput) {
  // expects: subjectId, groupId, teacherId, scheduled_weekday, scheduled_time
  return await prisma.session.create({
    data: {
      subjectId: data.subjectId,
      groupId: data.groupId,
      teacherId: data.teacherId,
      scheduled_weekday: data.scheduled_weekday,
      scheduled_time: data.scheduled_time,
    },
    include: {
      subject: true,
      group: true,
      teacher: { include: { user: true } },
    },
  });
}

export async function updateSession(data: SessionInput & { id: number }) {
  // expects: id, and any updatable fields
  return await prisma.session.update({
    where: { id: data.id },
    data: {
      subjectId: data.subjectId,
      groupId: data.groupId,
      teacherId: data.teacherId,
      scheduled_weekday: data.scheduled_weekday,
      scheduled_time: data.scheduled_time,
    },
    include: {
      subject: true,
      group: true,
      teacher: { include: { user: true } },
    },
  });
}

export async function deleteSession(id: number) {
  return await prisma.session.delete({
    where: { id },
  });
}
