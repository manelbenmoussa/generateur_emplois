import prisma from "./db";

export async function getSessionsBySchool(schoolId: number) {
  // Sessions are linked to subjects (which belong to departments which belong to school)
  // Also linked to groups through GroupSession join table
  return await prisma.session.findMany({
    where: {
      subject: {
        department: {
          schoolId,
        },
      },
    },
    include: {
      teacher: true,
      subject: true,
      groups: {
        include: {
          group: true,
        },
      },
    },
  });
}

export async function getSessionsByTeacher(teacherId: number) {
  return await prisma.session.findMany({
    where: { teacherId },
    include: {
      subject: true,
      groups: {
        include: {
          group: true,
        },
      },
    },
  });
}
