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

    const schoolIdNum = Number(schoolId);
    if (!Number.isInteger(schoolIdNum) || schoolIdNum <= 0) {
      return NextResponse.json(
        { error: "Invalid school selection" },
        { status: 400 }
      );
    }

    // Verify the school exists so we fail fast with a clear message
    const schoolExists = await prisma.school.findUnique({
      where: { id: schoolIdNum },
      select: { id: true },
    });

    if (!schoolExists) {
      return NextResponse.json(
        { error: "Selected school not found" },
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
    // We wrap the transaction in a function so we can retry once if the
    // failure is caused by an out-of-sync Postgres sequence (P2002 on Teacher.id).
    const runCreateTransaction = async () =>
      prisma.$transaction(async (tx) => {
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

        // role record creation (debug logs removed)

        // Create corresponding role record
        if (userRole === "ADMIN") {
          // creating administrator record
          await tx.administrator.create({
            data: {
              userId: user.id,
              schoolId: schoolIdNum,
            },
          });
        } else if (userRole === "TEACHER") {
          // creating teacher record
          await tx.teacher.create({
            data: {
              userId: user.id,
              schoolId: schoolIdNum,
            },
          });
        } else if (userRole === "STUDENT") {
          // creating student record
          await tx.student.create({
            data: {
              userId: user.id,
              schoolId: schoolIdNum,
            },
          });
        }

        return user;
      });

    let result;
    try {
      result = await runCreateTransaction();
    } catch (err) {
      // If Prisma reports a unique constraint on Teacher.id, it's likely the
      // Postgres sequence for the teacher table is out-of-sync. Attempt to fix
      // the sequence and retry once.
      type PrismaErr = {
        code?: string;
        meta?: { modelName?: string; target?: unknown };
      };
      const e = err as PrismaErr;
      if (
        e?.code === "P2002" &&
        e?.meta?.modelName === "Teacher" &&
        Array.isArray(e?.meta?.target) &&
        (e.meta.target as unknown[]).includes("id")
      ) {
        console.warn(
          "Detected P2002 on Teacher.id — attempting to fix sequence and retry"
        );

        // Get current max id
        const maxRes: Array<{ max_id: number }> = (await prisma.$queryRaw`
          SELECT COALESCE(MAX(id), 0) AS max_id FROM "Teacher"
        `) as Array<{ max_id: number }>;
        const maxId = (maxRes && maxRes[0] && Number(maxRes[0].max_id)) || 0;

        const nextVal = maxId + 1;
        // resetting Teacher id sequence (log removed)

        // Reset sequence using pg_get_serial_sequence; this will set the sequence
        // so the next nextval() returns nextVal.
        try {
          await prisma.$executeRaw`
            SELECT setval(pg_get_serial_sequence('"Teacher"', 'id'), ${nextVal}, false)
          `;
        } catch (seqErr) {
          console.error("Failed to reset Teacher id sequence:", seqErr);
          throw err; // rethrow original error
        }

        // Retry the transaction once
        try {
          result = await runCreateTransaction();
        } catch (retryErr) {
          console.error("Retry after sequence fix failed:", retryErr);
          throw retryErr;
        }
      } else {
        throw err;
      }
    }

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
    // Log full error for debugging
    console.error("Registration error:", error);

    // In development return the actual error message to help debugging.
    if (process.env.NODE_ENV !== "production") {
      type ErrWithMessage = { message?: string };
      const message =
        error && typeof (error as ErrWithMessage).message === "string"
          ? (error as ErrWithMessage).message
          : String(error);
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
