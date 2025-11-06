import { NextRequest, NextResponse } from "next/server";
import { getSessionsBySchool } from "@/dao/sessionDao";

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

    const sessions = await getSessionsBySchool(parseInt(String(schoolId)));
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
