import { NextResponse } from "next/server";
import { generateAndFormatTimetable } from "../../../services/timetableService";

export async function GET() {
  try {
    console.log("🚀 Starting timetable generation...");

    // --- TESTING: Hardcode schoolId to bypass session requirement ---
    const schoolId = 1;
    // const session: Session | null = getSessionFromRequestHeaders(
    //   req.headers as Headers
    // );

    // if (!session || !session.schoolId) {
    //   return NextResponse.json(
    //     { error: "Unauthorized or missing session" },
    //     { status: 401 }
    //   );
    // }

    console.log(`📊 Generating timetable for school ID: ${schoolId}`);
    const pdfPayload = await generateAndFormatTimetable(schoolId);
    console.log("✅ Timetable generated successfully");

    return NextResponse.json({ pdfPayload });
  } catch (err) {
    console.error("❌ Error generating timetable:", err);
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;

    return NextResponse.json(
      {
        error: message,
        details: stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
