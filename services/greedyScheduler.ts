import type { TimetableAlgorithmData } from "../dto/timeTableDto";
import type { ScheduleAssignment } from "../utils/pdfGenerator";

// ONE WEEK SCHEDULE: Monday to Friday (ultra-fast configuration)
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_SLOTS = [
  { startTime: "08:00", endTime: "09:30" },
  { startTime: "09:45", endTime: "11:15" },
  { startTime: "11:30", endTime: "13:00" },
  { startTime: "13:30", endTime: "15:00" },
  { startTime: "15:15", endTime: "17:00" },
  { startTime: "17:15", endTime: "18:45" },
];

const MAX_WEEKLY_SLOTS = DAYS.length * TIME_SLOTS.length; // 36 slots
const MAX_TEACHER_HOURS = 16.0; // Maximum weekly hours per teacher

/**
 * ⚡ HYPER-OPTIMIZED greedy scheduler with teacher hour limits.
 * Respects 16-hour weekly limit per teacher.
 */
export function runGreedyScheduling(
  data: TimetableAlgorithmData
): ScheduleAssignment[] {
  const startTime = Date.now();

  const assignments: ScheduleAssignment[] = [];
  const rooms = Object.values(data.rooms);

  // Track teacher hours: teacherId -> total hours assigned
  const teacherHours = new Map<number, number>();

  // Ultra-fast tracking: single string key for occupied slots
  const occupied = new Set<string>();

  // Pre-calculate slot keys for speed (avoid repeated string concatenation)
  const slotKeys: string[] = [];
  for (const day of DAYS) {
    for (const slot of TIME_SLOTS) {
      slotKeys.push(`${day}|${slot.startTime}|${slot.endTime}`);
    }
  }

  let scheduled = 0;
  let skipped = 0;
  let totalSlots = 0;

  // Sort sessions: prioritize 3-hour sessions (harder to schedule) first
  const sortedSessions = [...data.sessions].sort((a, b) => {
    const subjectA = data.subjects[a.subjectId!];
    const subjectB = data.subjects[b.subjectId!];
    if (!subjectA || !subjectB) return 0;
    const slotsA = Math.ceil((subjectA.hourVolume ?? 1.5) / 1.5);
    const slotsB = Math.ceil((subjectB.hourVolume ?? 1.5) / 1.5);
    // Schedule sessions needing more slots first (3-hour before 1.5-hour)
    return slotsB - slotsA;
  });

  // SMART LOOP: Try harder to fit all sessions by exploring all slot-room combinations
  sessionLoop: for (const session of sortedSessions) {
    // Quick validation (skip invalid sessions silently for speed)
    if (!session.teacherId || !session.subjectId || !session.groupId) {
      skipped++;
      continue;
    }

    const teacher = data.teachers[session.teacherId];
    if (!teacher?.specializedSubjectIds?.includes(session.subjectId)) {
      skipped++;
      continue;
    }

    const subject = data.subjects[session.subjectId];
    if (!subject || !subject.hourVolume) {
      skipped++;
      continue;
    }

    // Check if teacher has reached 16-hour limit
    const currentTeacherHours = teacherHours.get(session.teacherId) || 0;
    if (currentTeacherHours + subject.hourVolume > MAX_TEACHER_HOURS) {
      // Skip this session - teacher is overloaded
      skipped++;
      continue;
    }

    // Calculate how many 1.5-hour slots this session needs
    const slotsNeeded = Math.ceil(subject.hourVolume / 1.5);

    // Try to place all required slots for this session
    let slotsPlaced = 0;
    const placedSlots: Array<{
      day: string;
      startTime: string;
      roomId: number;
    }> = [];

    // Try all combinations of slots and rooms
    for (const slotKey of slotKeys) {
      if (slotsPlaced >= slotsNeeded) {
        break;
      }

      const [day, startTime] = slotKey.split("|");
      const teacherKey = `T${session.teacherId}-${day}-${startTime}`;
      const groupKey = `G${session.groupId}-${day}-${startTime}`;

      // Skip if teacher or group is already busy at this time
      if (occupied.has(teacherKey) || occupied.has(groupKey)) {
        continue;
      }

      // Try to find an available room for this slot
      for (const room of rooms) {
        const roomKey = `R${room.id}-${day}-${startTime}`;

        if (!occupied.has(roomKey)) {
          // ✅ Found an available slot-room combination
          placedSlots.push({ day, startTime, roomId: room.id });

          // Temporarily mark as occupied
          occupied.add(teacherKey);
          occupied.add(groupKey);
          occupied.add(roomKey);

          slotsPlaced++;
          break; // Found room for this slot, move to next slot
        }
      }
    }

    // Check if we successfully placed all required slots
    if (slotsPlaced >= slotsNeeded) {
      // Commit all placements
      for (const placement of placedSlots) {
        const slot = TIME_SLOTS.find(
          (s) => s.startTime === placement.startTime
        )!;
        assignments.push({
          id: ++totalSlots,
          day: placement.day,
          startTime: placement.startTime,
          endTime: slot.endTime,
          sessionId: session.id,
          subjectId: session.subjectId,
          teacherId: session.teacherId,
          groupId: session.groupId,
          roomId: placement.roomId,
        });
      }
      // Update teacher hours
      teacherHours.set(
        session.teacherId,
        currentTeacherHours + subject.hourVolume
      );
      scheduled++;
    } else {
      // Rollback if we couldn't place all slots
      for (const placement of placedSlots) {
        const teacherKey = `T${session.teacherId}-${placement.day}-${placement.startTime}`;
        const groupKey = `G${session.groupId}-${placement.day}-${placement.startTime}`;
        const roomKey = `R${placement.roomId}-${placement.day}-${placement.startTime}`;
        occupied.delete(teacherKey);
        occupied.delete(groupKey);
        occupied.delete(roomKey);
      }
      skipped++;
    }
  }

  const elapsedTime = Date.now() - startTime;

  // Log teacher hour utilization
  const overloadedTeachers = Array.from(teacherHours.entries()).filter(
    ([, hours]) => hours > MAX_TEACHER_HOURS
  );
  if (overloadedTeachers.length > 0) {
    console.warn(
      `⚠️ Warning: ${overloadedTeachers.length} teachers exceed ${MAX_TEACHER_HOURS}h limit`
    );
  }

  // Minimal logging for speed
  console.log(
    `⚡ HYPER-FAST Scheduler: ${scheduled}/${data.sessions.length} sessions scheduled in ${elapsedTime}ms`
  );
  console.log(
    `📊 Total time slots assigned: ${totalSlots} | Utilization: ${Math.round(
      (totalSlots / MAX_WEEKLY_SLOTS) * 100
    )}% | Skipped: ${skipped} sessions`
  );
  console.log(
    `👨‍🏫 Teacher hours: ${teacherHours.size} teachers used, max ${Math.max(
      ...Array.from(teacherHours.values())
    )}h`
  );

  // Only throw if NOTHING was scheduled (likely data issue)
  if (scheduled === 0 && data.sessions.length > 0) {
    throw new Error(
      `❌ Could not schedule any sessions. Check:\n` +
        `• Teacher specializations match session subjects\n` +
        `• Sessions have valid teacherId, subjectId, groupId\n` +
        `• At least one room exists`
    );
  }

  return assignments;
}
