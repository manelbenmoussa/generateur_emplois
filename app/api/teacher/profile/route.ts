import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/teacher/profile?userId=<userId>
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findFirst({
      where: { userId },
      include: { user: true, subjects: { include: { subject: true } } },
    });

    if (!teacher)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ teacher });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
