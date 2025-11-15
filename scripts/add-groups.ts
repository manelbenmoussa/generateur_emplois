import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding sample groups...");

  // Get the school
  const school = await prisma.school.findFirst();
  if (!school) {
    console.error("No school found. Run setup-admin.ts first.");
    return;
  }

  // Get or create department
  let department = await prisma.department.findFirst({
    where: { schoolId: school.id },
  });

  if (!department) {
    department = await prisma.department.create({
      data: {
        name: "Computer Science",
        schoolId: school.id,
      },
    });
    console.log("Created department:", department.name);
  }

  // Get or create specialization
  let specialization = await prisma.specialization.findFirst({
    where: { departmentId: department.id },
  });

  if (!specialization) {
    specialization = await prisma.specialization.create({
      data: {
        name: "Software Engineering",
        departmentId: department.id,
      },
    });
    console.log("Created specialization:", specialization.name);
  }

  // Create groups
  const groups = [
    { level: "1st Year - Group A" },
    { level: "1st Year - Group B" },
    { level: "2nd Year - Group A" },
    { level: "2nd Year - Group B" },
    { level: "3rd Year - Group A" },
  ];

  for (const groupData of groups) {
    const existing = await prisma.group.findFirst({
      where: {
        level: groupData.level,
        specializationId: specialization.id,
      },
    });

    if (!existing) {
      await prisma.group.create({
        data: {
          level: groupData.level,
          specializationId: specialization.id,
        },
      });
      console.log("Created group:", groupData.level);
    } else {
      console.log("Group already exists:", groupData.level);
    }
  }

  console.log("\n✅ Sample groups added successfully!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
