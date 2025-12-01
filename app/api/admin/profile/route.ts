import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById, updateUser } from "@/dao/userDao";
import type { UserWithProfile } from "@/dao/userDao";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getUserById(session.user.id as string);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Return a copy without the password field
  const safeUser: Partial<UserWithProfile> = { ...user };
  if (
    "password" in safeUser &&
    (safeUser as unknown as { password?: string }).password
  ) {
    delete (safeUser as unknown as { password?: string }).password;
  }
  return NextResponse.json({ user: safeUser });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const updateData: { name?: string; email?: string; password?: string } = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.password) {
    const hashed = await bcrypt.hash(body.password, 12);
    updateData.password = hashed;
  }

  try {
    const updated = await updateUser(session.user.id as string, updateData);
    const safeUpdated: Partial<UserWithProfile> = { ...updated };
    if (
      "password" in safeUpdated &&
      (safeUpdated as unknown as { password?: string }).password
    ) {
      delete (safeUpdated as unknown as { password?: string }).password;
    }
    return NextResponse.json({ user: safeUpdated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
