import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createTeacher } from "@/dao/teacherDao";

/**
 * POST /api/users/[userId]/link-teacher
 * Create a teacher profile and link it to the user
 * Body: { schoolId: number, subjectIds?: number[] }
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

    // Only admins can link users to teacher profiles
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = params;
    const body = await request.json();
    const { schoolId, subjectIds } = body;

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 }
      );
    }

    // Create teacher profile
    const teacher = await createTeacher({
      userId,
      schoolId,
      subjectIds,
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    console.error("Error linking teacher profile:", error);

    // Handle unique constraint violation (userId already has a teacher profile)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "User already has a teacher profile" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create teacher profile" },
      { status: 500 }
    );
  }
}
