import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createStudent } from "@/dao/studentDao";

/**
 * POST /api/users/[userId]/link-student
 * Create a student profile and link it to the user
 * Body: { schoolId: number, firstName?: string, lastName?: string, groupId?: number }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can link users to student profiles
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = params;
    const body = await request.json();
    const { schoolId, firstName, lastName, groupId } = body;

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 }
      );
    }

    // Create student profile
    const student = await createStudent({
      userId,
      schoolId,
      firstName,
      lastName,
      groupId,
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error linking student profile:", error);

    // Handle unique constraint violation (userId already has a student profile)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "User already has a student profile" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create student profile" },
      { status: 500 }
    );
  }
}
