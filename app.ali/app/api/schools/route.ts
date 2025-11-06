import { NextResponse } from "next/server";
import { getSchools } from "@/dao/schoolDao";

export async function GET() {
  try {
    const schools = await getSchools();
    return NextResponse.json({ schools });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}
