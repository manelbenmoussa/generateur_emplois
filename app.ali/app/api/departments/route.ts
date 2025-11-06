import { NextRequest, NextResponse } from "next/server";
import { getDepartmentsBySchool } from "@/dao/departmentDao";

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

    const departments = await getDepartmentsBySchool(
      parseInt(String(schoolId))
    );
    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}
