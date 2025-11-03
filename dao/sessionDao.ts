import prisma from "./db";

export async function getSessionsBySchool(schoolId: number) {
  // Sessions are linked to subjects (which belong to departments which belong to school)
  // Also linked to a single group directly
  return await prisma.session.findMany({
    where: {
      subject: {
        department: {
          schoolId,
        },
      },
    },
    include: {
      subject: true,
      group: true,
    },
  });
}
