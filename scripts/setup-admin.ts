import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting setup...");

  // Create or get school
  let school = await prisma.school.findFirst();
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: "Default School",
        address: "123 Main St",
      },
    });
    console.log("Created school:", school.name);
  } else {
    console.log("Using existing school:", school.name);
  }

  // Check if admin user exists
  const adminEmail = "admin@school.com";
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { administrator: true },
  });

  let userId: string;

  if (!existingUser) {
    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const newUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
      },
    });
    userId = newUser.id;
    console.log("Created admin user:", adminEmail);
  } else {
    userId = existingUser.id;
    console.log("Admin user already exists:", adminEmail);
  }

  // Link user to school as administrator if not already linked
  const existingAdmin = await prisma.administrator.findUnique({
    where: { userId },
  });

  if (!existingAdmin) {
    await prisma.administrator.create({
      data: {
        userId,
        schoolId: school.id,
      },
    });
    console.log("Linked user to school as administrator");
  } else {
    console.log("User already linked to school");
  }

  // Create a department
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
  } else {
    console.log("Department already exists:", department.name);
  }

  console.log("\n✅ Setup complete!");
  console.log("\nYou can now login with:");
  console.log("Email: admin@school.com");
  console.log("Password: admin123");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
