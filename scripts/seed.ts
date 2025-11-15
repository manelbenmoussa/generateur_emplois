import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create a school
  const school = await prisma.school.upsert({
    where: { name: "Default School" },
    update: {},
    create: {
      name: "Default School",
      address: "123 Education Street",
    },
  });
  console.log("✅ School created:", school.name);

  // Create an admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: {
      email: "admin@school.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", adminUser.email);

  // Link admin to school
  await prisma.administrator.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      schoolId: school.id,
    },
  });
  console.log("✅ Administrator linked to school");

  // Create some departments
  const departments = await prisma.department.findMany({
    where: { schoolId: school.id },
  });

  let csDept = departments.find((d) => d.name === "Computer Science");
  if (!csDept) {
    csDept = await prisma.department.create({
      data: {
        name: "Computer Science",
        schoolId: school.id,
      },
    });
    console.log("✅ Department created:", csDept.name);
  } else {
    console.log("✅ Department exists:", csDept.name);
  }

  let mathDept = departments.find((d) => d.name === "Mathematics");
  if (!mathDept) {
    mathDept = await prisma.department.create({
      data: {
        name: "Mathematics",
        schoolId: school.id,
      },
    });
    console.log("✅ Department created:", mathDept.name);
  } else {
    console.log("✅ Department exists:", mathDept.name);
  }

  // Create some rooms
  await prisma.room.upsert({
    where: {
      unique_room_name_per_school: {
        name: "Room 101",
        schoolId: school.id,
      },
    },
    update: {},
    create: {
      name: "Room 101",
      capacity: 30,
      schoolId: school.id,
      departmentId: csDept.id,
    },
  });
  console.log("✅ Room created: Room 101");

  await prisma.room.upsert({
    where: {
      unique_room_name_per_school: {
        name: "Room 102",
        schoolId: school.id,
      },
    },
    update: {},
    create: {
      name: "Room 102",
      capacity: 25,
      schoolId: school.id,
      departmentId: mathDept.id,
    },
  });
  console.log("✅ Room created: Room 102");

  console.log("🎉 Seed completed!");
  console.log("\n📝 You can now login with:");
  console.log("   Email: admin@school.com");
  console.log("   Password: admin123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
