import type { AssembledPayloadDto } from "../dto/timeTableDto";

// Represents a single scheduled class session for the PDF.
export interface PdfSession {
  id: number | string;
  subject: string;
  teacher: string;
  group: string;
  specialization: string;
  room: string;
  dateTime: string; // e.g., "Monday 08:00 - 09:30"
}

// The final JSON structure for the PDF generator.
export interface PdfPayload {
  school: {
    name: string;
    address: string | null;
  };
  sessions: PdfSession[];
}

// A placeholder for the actual algorithm's output.
// The real algorithm will produce an array of these assignments.
export interface ScheduleAssignment {
  id: number | string;
  day: string;
  startTime: string;
  endTime: string;
  sessionId: number;
  subjectId: number;
  teacherId: number;
  groupId: number;
  roomId: number;
}

/**
 * Formats the raw schedule assignments into a user-friendly payload for the PDF generator.
 *
 * @param assignments The raw output from the scheduling algorithm.
 * @param data The original flat data used to look up names and details.
 * @returns The formatted payload ready for PDF generation.
 */
export function formatScheduleForPdf(
  assignments: ScheduleAssignment[],
  data: AssembledPayloadDto
): PdfPayload {
  if (!data.school) {
    throw new Error("School information is missing.");
  }

  // Create maps for fast lookups, just like the algorithm does.
  const subjects = new Map(data.subjects.map((s) => [s.id, s]));
  const teachers = new Map(data.teachers.map((t) => [t.id, t]));
  const groups = new Map(data.groups.map((g) => [g.id, g]));
  const rooms = new Map(data.rooms.map((r) => [r.id, r]));
  const specializations = new Map(
    data.specializations.map((sp) => [sp.id, sp])
  );

  const pdfSessions: PdfSession[] = assignments.map((assignment) => {
    const subject = subjects.get(assignment.subjectId);
    const teacher = teachers.get(assignment.teacherId);
    const group = groups.get(assignment.groupId);
    const room = rooms.get(assignment.roomId);
    const specialization = group?.specializationId
      ? specializations.get(group.specializationId)
      : null;

    return {
      id: assignment.id,
      subject: subject?.name ?? "Unknown Subject",
      teacher: teacher?.name ?? "Unknown Teacher",
      group: group?.level ?? `Group ${assignment.groupId}`, // Fallback to ID if level is not set
      specialization: specialization?.name ?? "No Specialization",
      room: room?.name ?? `Room ${assignment.roomId}`,
      dateTime: `${assignment.day} ${assignment.startTime} - ${assignment.endTime}`,
    };
  });

  return {
    school: {
      name: data.school.name,
      address: data.school.address ?? null,
    },
    sessions: pdfSessions,
  };
}
