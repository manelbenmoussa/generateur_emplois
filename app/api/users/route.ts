import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsers } from "@/dao/userDao";
import { UserRole } from "@prisma/client";

/**
 * GET /api/users?role=TEACHER
 * Get all users, optionally filtered by role
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get role filter from query params
    const searchParams = request.nextUrl.searchParams;
    const roleParam = searchParams.get("role");

    let role: UserRole | undefined;
    if (roleParam && ["ADMIN", "TEACHER", "STUDENT"].includes(roleParam)) {
      role = roleParam as UserRole;
    }

    // Fetch users
    const users = await getUsers(role);

    // Remove sensitive data (password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sanitizedUsers = users.map(({ password: _, ...user }) => user);

    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
