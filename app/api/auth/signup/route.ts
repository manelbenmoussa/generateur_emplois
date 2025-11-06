import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, image, schoolId } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    if (!schoolId) {
      return NextResponse.json(
        { error: "Missing school selection" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Validate role
    const validRoles = ["ADMIN", "TEACHER", "STUDENT"];
    const userRole = role && validRoles.includes(role) ? role : "STUDENT";

    // Create user and corresponding role record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: userRole,
          image: image || null,
        },
      });

      // Create corresponding role record
      if (userRole === "ADMIN") {
        await tx.administrator.create({
          data: {
            userId: user.id,
            schoolId: parseInt(schoolId),
          },
        });
      } else if (userRole === "TEACHER") {
        await tx.teacher.create({
          data: {
            userId: user.id,
            schoolId: parseInt(schoolId),
          },
        });
      } else if (userRole === "STUDENT") {
        await tx.student.create({
          data: {
            userId: user.id,
            schoolId: parseInt(schoolId),
          },
        });
      }

      return user;
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: result.id,
          email: result.email,
          role: result.role,
          image: result.image,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
