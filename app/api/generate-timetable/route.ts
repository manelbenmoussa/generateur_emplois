import { NextResponse } from "next/server";
import {
  assembleAllEntitiesForSchool,
  isAssembledPayloadDto,
} from "@/dto/timeTableDto";

import { formatScheduleForPdf } from "@/utils/pdfGenerator";

export async function GET() {
  try {
    // --- TESTING: Hardcode schoolId to bypass session requirement ---
    const schoolId = 1;

    // 1. Show raw session data from the database before DTO mapping
    const sessionDao = await import("@/dao/sessionDao");
    const rawSessions = await sessionDao.getSessionsBySchool(schoolId);
    // keep for debugging but avoid "assigned but never used" linter error
    console.debug(
      "rawSessions sample:",
      rawSessions?.slice?.(0, 3) ?? rawSessions
    );

    // 2. Get the clean, flat data from the database (DTO mapping)
    const flatData = await assembleAllEntitiesForSchool(schoolId);

    if (!isAssembledPayloadDto(flatData)) {
      return NextResponse.json(
        { error: "Assembled payload validation failed" },
        { status: 500 }
      );
    }

    // 2. Call the Python FastAPI timetable endpoint directly

    const response = await fetch("http://127.0.0.1:8000/generate-greedy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: flatData }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Python generate-greedy returned non-ok:",
        response.status,
        errorText
      );
      throw new Error(`Python API error: ${response.status} ${errorText}`);
    }
    const { assignments } = await response.json();

    console.log({ assignments });

    // 3a. Persist assignments -> update each session in DB with scheduled weekday & time
    try {
      const sessionDao = await import("@/dao/sessionDao");
      // Reduce to unique session assignments (one update per session) - prefer first occurrence
      type Assignment = {
        sessionId: number;
        subjectId: number;
        groupId: number;
        teacherId?: number | null;
        roomId?: number | null;
        day?: string | null;
        startTime?: string | null;
        endTime?: string | null;
      };
      const uniqueBySession = new Map<number, Assignment | undefined>();
      (assignments || []).forEach((a: Assignment) => {
        if (!uniqueBySession.has(a.sessionId))
          uniqueBySession.set(a.sessionId, a);
      });

      // Create update tasks for each unique session assignment. Use Promise.all to run in parallel.
      const updateTasks = Array.from(uniqueBySession.values())
        .filter((v): v is Assignment => !!v)
        .map((a: Assignment) =>
          sessionDao.updateSession({
            id: Number(a.sessionId),
            subjectId: Number(a.subjectId),
            groupId: Number(a.groupId),
            teacherId: a.teacherId ?? null,
            roomId: a.roomId ?? null,
            scheduled_weekday: a.day ?? null,
            scheduled_time: a.startTime ?? null,
          })
        );
      const results = await Promise.all(updateTasks);
      console.log("Persisted assignments count:", results.length);
    } catch (err) {
      console.error("Failed to persist assignments to DB:", err);
      // allow the flow to continue; we still attempt to create the PDF preview
    }
    // 3. Format the assignments into the final JSON for the PDF.
    const pdfPayload = formatScheduleForPdf(assignments, flatData);

    return NextResponse.json({ pdfPayload });
  } catch (err) {
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
