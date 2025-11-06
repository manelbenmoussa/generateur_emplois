import { NextResponse } from "next/server";
import { generateAndFormatTimetable } from "../../../services/timetableService";

export async function GET() {
  try {
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

    const pdfPayload = await generateAndFormatTimetable(schoolId);
    return NextResponse.json({ pdfPayload });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
