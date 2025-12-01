import prisma from "./db";

export async function getSessionsBySchool(schoolId: number) {
  // Sessions are linked to a group, which is linked to a specialization, which is linked to a department, which is linked to a school
  // We still return subject, group, and teacher.user for UI consumption.
  return await prisma.session.findMany({
    where: {
      group: {
        specialization: {
          department: {
            schoolId,
          },
        },
      },
    },
    include: {
      subject: true,
      group: {
        include: {
          specialization: {
            include: {
              department: true,
            },
          },
        },
      },
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
  // teacher may be optional (unassigned) during creation and updates
  teacherId?: number | null;
  roomId?: number | null;
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

export async function updateSession(
  data: Partial<SessionInput> & { id: number }
) {
  // expects: id, and any updatable fields
  const updateData: Record<string, unknown> = {};
  if (data.subjectId !== undefined) updateData.subjectId = data.subjectId;
  if (data.groupId !== undefined) updateData.groupId = data.groupId;
  if ("teacherId" in data) updateData.teacherId = data.teacherId;
  if ("roomId" in data) updateData.roomId = data.roomId;
  if ("scheduled_weekday" in data)
    updateData.scheduled_weekday = data.scheduled_weekday;
  if ("scheduled_time" in data) updateData.scheduled_time = data.scheduled_time;

  return await prisma.session.update({
    where: { id: data.id },
    data: updateData,
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
