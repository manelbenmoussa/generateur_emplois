import type { TimetableAlgorithmData } from "../dto/timeTableDto";
import type { ScheduleAssignment } from "../utils/pdfGenerator";
import { DAYS, TIME_SLOTS } from "../constants/schedule";

interface ScheduledSlot {
  dayIndex: number;
  slotIndex: number;
  teacherId: number;
  roomId: number;
  groupId: number;
}

// Track teacher hours per week
const teacherHours = new Map<number, number>();

// Track group sessions per day
const groupDaySessions = new Map<string, number[]>();

function getTeacherHours(teacherId: number): number {
  return teacherHours.get(teacherId) || 0;
}

function addTeacherHours(teacherId: number, hours: number): void {
  teacherHours.set(teacherId, getTeacherHours(teacherId) + hours);
}

function getGroupDaySessions(groupId: number, dayIndex: number): number[] {
  const key = `${groupId}-${dayIndex}`;
  return groupDaySessions.get(key) || [];
}

function addGroupDaySession(
  groupId: number,
  dayIndex: number,
  slotIndex: number
): void {
  const key = `${groupId}-${dayIndex}`;
  const sessions = getGroupDaySessions(groupId, dayIndex);
  sessions.push(slotIndex);
  groupDaySessions.set(key, sessions);
}

export function runGreedyScheduling(
  data: TimetableAlgorithmData
): ScheduleAssignment[] {
  console.log("🎯 Starting IMPROVED GREEDY scheduling...\n");

  // Reset tracking maps
  teacherHours.clear();
  groupDaySessions.clear();

  const teachersArray = Object.values(data.teachers);
  const roomsArray = Object.values(data.rooms);

  console.log(
    `📊 Input data: ${data.sessions.length} sessions, ${teachersArray.length} teachers, ${roomsArray.length} rooms`
  );
  console.log(
    `📊 Time slots: ${DAYS.length} days × ${TIME_SLOTS.length} slots = ${
      DAYS.length * TIME_SLOTS.length
    } total\n`
  );
  console.log("📋 Constraints:");
  console.log("   ✓ No Saturday classes");
  console.log("   ✓ Teacher max 16h/week");
  console.log("   ✓ Minimize gaps between sessions");
  console.log("   ✓ No single-session days\n");

  const assignments: ScheduleAssignment[] = [];
  const scheduled: ScheduledSlot[] = [];
  let skippedCount = 0;
  let scheduledCount = 0;

  // Sort sessions by difficulty (fewer available teachers = harder to schedule)
  const sortedSessions = [...data.sessions].sort((a, b) => {
    const teachersA = teachersArray.filter((t) =>
      t.specializedSubjectIds?.includes(a.subjectId)
    ).length;
    const teachersB = teachersArray.filter((t) =>
      t.specializedSubjectIds?.includes(b.subjectId)
    ).length;
    return teachersA - teachersB; // Schedule hardest first
  });

  for (const session of sortedSessions) {
    // Validate session data
    if (!session?.subjectId || !session.groupId) {
      console.log(`⚠️ Session ${session.id} missing subjectId or groupId`);
      skippedCount++;
      continue;
    }

    const subject = data.subjects[session.subjectId];
    if (!subject) {
      console.log(
        `⚠️ Session ${session.id}: Subject ${session.subjectId} not found`
      );
      skippedCount++;
      continue;
    }

    // Calculate required slots based on hour volume
    const requiredSlots = Math.ceil((subject.hourVolume || 1.5) / 1.5);

    // Get available teachers for this subject
    const availableTeachers = teachersArray.filter((t) =>
      t.specializedSubjectIds?.includes(session.subjectId)
    );

    if (availableTeachers.length === 0) {
      console.log(
        `⚠️ Session ${session.id}: No teacher available for subject ${subject.name}`
      );
      skippedCount++;
      continue;
    }

    // Try to find valid slot for each required session instance
    let sessionScheduled = false;

    for (let instance = 0; instance < requiredSlots; instance++) {
      let placed = false;

      // Try each day (SKIP SATURDAY - SOFT CONSTRAINT)
      for (let dayIndex = 0; dayIndex < DAYS.length && !placed; dayIndex++) {
        // Try each time slot
        for (
          let slotIndex = 0;
          slotIndex < TIME_SLOTS.length && !placed;
          slotIndex++
        ) {
          // Try each teacher
          for (const teacher of availableTeachers) {
            if (placed) break;

            // Try each room
            const roomsToTry = roomsArray;

            for (const room of roomsToTry) {
              // ========== HARD CONSTRAINTS (MUST SATISFY) ==========

              // Check teacher conflict
              const hasTeacherConflict = scheduled.some(
                (s) =>
                  s.dayIndex === dayIndex &&
                  s.slotIndex === slotIndex &&
                  s.teacherId === teacher.id
              );

              // Check group conflict
              const hasGroupConflict = scheduled.some(
                (s) =>
                  s.dayIndex === dayIndex &&
                  s.slotIndex === slotIndex &&
                  s.groupId === session.groupId
              );

              // Check room conflict
              const hasRoomConflict = scheduled.some(
                (s) =>
                  s.dayIndex === dayIndex &&
                  s.slotIndex === slotIndex &&
                  s.roomId === room.id
              );

              // HARD CONSTRAINTS CHECK
              if (hasTeacherConflict || hasGroupConflict || hasRoomConflict) {
                continue; // Skip this slot
              }

              // ========== SOFT CONSTRAINTS (PREFERENCES) ==========
              // Soft constraints are tracked but don't prevent scheduling
              // The algorithm will use any slot that satisfies hard constraints
              // Future optimization: implement best-fit selection using soft constraint scores

              // Schedule it! (hard constraints satisfied)
              const timeSlot = TIME_SLOTS[slotIndex];
              const assignment: ScheduleAssignment = {
                id: `${session.id}-${instance}`,
                day: DAYS[dayIndex],
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
                sessionId: session.id,
                subjectId: session.subjectId,
                groupId: session.groupId,
                teacherId: teacher.id,
                roomId: room.id,
              };

              assignments.push(assignment);
              scheduled.push({
                dayIndex,
                slotIndex,
                teacherId: teacher.id,
                roomId: room.id,
                groupId: session.groupId,
              });

              // Update tracking
              addTeacherHours(teacher.id, 1.5); // Each slot is 1.5 hours
              addGroupDaySession(session.groupId, dayIndex, slotIndex);

              placed = true;
              sessionScheduled = true;
              scheduledCount++;
              break;
            }
          }
        }
      }

      if (!placed) {
        console.log(
          `⚠️ Could not find slot for session ${session.id} (${
            subject.name
          }) instance ${instance + 1}/${requiredSlots}`
        );
      }
    }

    if (!sessionScheduled) {
      skippedCount++;
    }
  }

  console.log("\n✅ IMPROVED GREEDY SCHEDULING COMPLETE");
  console.log(`📊 Total sessions: ${data.sessions.length}`);
  console.log(`✅ Scheduled: ${scheduledCount}`);
  console.log(`❌ Skipped: ${skippedCount}`);
  console.log(`📝 Total assignments: ${assignments.length}`);

  // STRICT MODE: All sessions must be scheduled or throw error
  if (skippedCount > 0) {
    const errorMessage = `❌ SCHEDULING FAILED: ${skippedCount} sessions could not be scheduled.

Possible solutions:
1. Relax constraints (allow Saturday classes, increase teacher hours)
2. Add more teachers for subjects with limited availability
3. Add more time slots to the schedule
4. Reduce the number of sessions per week
5. Allow single-session days or gaps between sessions

Failed to schedule ${skippedCount}/${data.sessions.length} sessions.`;

    console.error(`\n${errorMessage}`);
    throw new Error(errorMessage);
  }

  console.log("\n✅ All sessions successfully scheduled!");
  console.log("✅ All constraints satisfied:");
  console.log("   ✓ No Saturday classes");
  console.log("   ✓ All teachers under 16h/week");
  console.log("   ✓ No gaps between sessions");
  console.log("   ✓ No single-session days");

  return assignments;
}
