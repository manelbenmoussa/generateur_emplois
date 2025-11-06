import { NextRequest, NextResponse } from "next/server";
import prisma from "@/dao/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 }
      );
    }

    const subjects = await prisma.subject.findMany({
      where: {
        department: { schoolId: parseInt(String(schoolId)) },
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
