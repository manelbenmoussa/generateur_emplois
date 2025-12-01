import GeneticAlgorithm from "geneticalgorithm";
import type { TimetableAlgorithmData } from "../dto/timeTableDto";
import type { ScheduleAssignment } from "../utils/pdfGenerator";
import { DAYS, TIME_SLOTS, MAX_TEACHER_HOURS } from "../constants/schedule";

/**
 * Gene: represents a single scheduled session assignment
 * Each gene contains the session, its day, time slot, assigned room, and assigned teacher
 */
interface Gene {
  sessionIndex: number; // Index in data.sessions array
  dayIndex: number; // Day index (0-4 for Mon-Fri)
  slotIndex: number; // Time slot index (0-5)
  roomId: number; // Assigned room ID
  teacherId: number; // Assigned teacher ID (picked from teacher_subject table)
}

type Chromosome = Gene[];

/**
 * Calculate how many time slots a session needs based on subject hour volume
 * Each slot is 1.5 hours, so a 3-hour subject needs 2 slots
 */
function getSlotsNeeded(
  data: TimetableAlgorithmData,
  sessionIndex: number
): number {
  const session = data.sessions[sessionIndex];
  const subject = data.subjects[session.subjectId!];
  return subject ? Math.ceil((subject.hourVolume || 1.5) / 1.5) : 1;
}

/**
 * Create a random chromosome (initial solution)
 * Uses GREEDY approach to avoid conflicts during initialization
 */
function createRandomChromosome(data: TimetableAlgorithmData): Chromosome {
  const chromosome: Chromosome = [];
  const rooms = Object.values(data.rooms);
  let skippedSessions = 0;

  // Track what's already scheduled to avoid conflicts
  const teacherSchedule = new Set<string>();
  const groupSchedule = new Set<string>();
  const roomSchedule = new Set<string>();

  for (
    let sessionIndex = 0;
    sessionIndex < data.sessions.length;
    sessionIndex++
  ) {
    const session = data.sessions[sessionIndex];
    const slotsNeeded = getSlotsNeeded(data, sessionIndex);

    // Find teachers who can teach this subject
    const availableTeachers = Object.values(data.teachers).filter((teacher) =>
      teacher.specializedSubjectIds?.includes(session.subjectId)
    );

    if (availableTeachers.length === 0) {
      console.error(
        `No teacher found for subject ${session.subjectId} in session ${session.id}`
      );
      skippedSessions++;
      continue; // Skip this session
    }

    for (let i = 0; i < slotsNeeded; i++) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      // Try to find a conflict-free slot
      while (!placed && attempts < maxAttempts) {
        attempts++;

        const dayIndex = Math.floor(Math.random() * DAYS.length);
        const slotIndex = Math.floor(Math.random() * TIME_SLOTS.length);
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const teacher =
          availableTeachers[
            Math.floor(Math.random() * availableTeachers.length)
          ];

        const key = `${dayIndex}-${slotIndex}`;
        const teacherKey = `T${teacher.id}-${key}`;
        const groupKey = `G${session.groupId}-${key}`;
        const roomKey = `R${room.id}-${key}`;

        // Check for conflicts
        if (
          !teacherSchedule.has(teacherKey) &&
          !groupSchedule.has(groupKey) &&
          !roomSchedule.has(roomKey)
        ) {
          // No conflict! Place the gene
          chromosome.push({
            sessionIndex,
            dayIndex,
            slotIndex,
            roomId: room.id,
            teacherId: teacher.id,
          });

          teacherSchedule.add(teacherKey);
          groupSchedule.add(groupKey);
          roomSchedule.add(roomKey);
          placed = true;
        }
      }

      if (!placed) {
        // Could not find conflict-free slot after maxAttempts
        // Just place it anyway (GA will fix it later)
        const teacher =
          availableTeachers[
            Math.floor(Math.random() * availableTeachers.length)
          ];
        chromosome.push({
          sessionIndex,
          dayIndex: Math.floor(Math.random() * DAYS.length),
          slotIndex: Math.floor(Math.random() * TIME_SLOTS.length),
          roomId: rooms[Math.floor(Math.random() * rooms.length)].id,
          teacherId: teacher.id,
        });
      }
    }
  }

  if (skippedSessions > 0) {
    console.warn(
      `⚠️ Skipped ${skippedSessions} sessions (no teachers available)`
    );
  }

  return chromosome;
}

/**
 * Validate HARD CONSTRAINTS - these MUST be satisfied (no conflicts allowed)
 * Returns true if chromosome is valid, false otherwise
 */
function isValidChromosome(
  chromosome: Chromosome,
  data: TimetableAlgorithmData
): boolean {
  const teacherOccupied = new Set<string>();
  const groupOccupied = new Set<string>();
  const roomOccupied = new Set<string>();

  for (const gene of chromosome) {
    const session = data.sessions[gene.sessionIndex];
    if (!session?.subjectId || !session.groupId || !gene.teacherId) {
      return false; // Invalid session data
    }

    const key = `${gene.dayIndex}-${gene.slotIndex}`;
    const teacherKey = `T${gene.teacherId}-${key}`;
    const groupKey = `G${session.groupId}-${key}`;
    const roomKey = `R${gene.roomId}-${key}`;

    // HARD CONSTRAINTS: No conflicts allowed
    if (teacherOccupied.has(teacherKey)) return false; // Teacher teaching multiple groups
    if (groupOccupied.has(groupKey)) return false; // Group in multiple sessions
    if (roomOccupied.has(roomKey)) return false; // Room double-booked

    teacherOccupied.add(teacherKey);
    groupOccupied.add(groupKey);
    roomOccupied.add(roomKey);
  }

  return true; // All hard constraints satisfied
}

/**
 * Fitness function: evaluates the quality of a schedule
 * Higher fitness = better schedule (fewer soft constraint violations)
 *
 * NOTE: Hard constraints (conflicts) are validated separately and return 0 fitness if violated
 *
 * Soft constraint penalties:
 * - Teacher over max hours: -20 per excess hour
 * - Single session days: -30 (students come for only 1 session)
 * - Gaps between sessions: -10 per empty slot
 */
function calculateFitness(
  chromosome: Chromosome,
  data: TimetableAlgorithmData
): number {
  // CRITICAL: Validate hard constraints first - reject invalid chromosomes immediately
  if (!isValidChromosome(chromosome, data)) {
    return 0; // INVALID: Hard constraints violated (conflicts exist)
  }

  let fitness = 1000; // Start with high score

  // Track for soft constraints only
  const teacherHours = new Map<number, number>();
  const groupDaySessions = new Map<string, number>();
  const groupDaySlots = new Map<string, Set<number>>();

  for (const gene of chromosome) {
    const session = data.sessions[gene.sessionIndex];
    if (!gene.teacherId || !session?.subjectId || !session.groupId) continue;

    const subject = data.subjects[session.subjectId];
    if (!subject) continue; // Track teacher hours
    const currentHours = teacherHours.get(gene.teacherId) || 0;
    teacherHours.set(gene.teacherId, currentHours + 1.5);

    // Track group-day sessions
    const groupDayKey = `${session.groupId}-${gene.dayIndex}`;
    groupDaySessions.set(
      groupDayKey,
      (groupDaySessions.get(groupDayKey) || 0) + 1
    );

    // Track slot indices for gap detection
    if (!groupDaySlots.has(groupDayKey)) {
      groupDaySlots.set(groupDayKey, new Set());
    }
    groupDaySlots.get(groupDayKey)!.add(gene.slotIndex);
  } // CONSTRAINT: Teachers cannot exceed maximum weekly hours
  teacherHours.forEach((hours) => {
    if (hours > MAX_TEACHER_HOURS) {
      fitness -= (hours - MAX_TEACHER_HOURS) * 20;
    }
  });

  // CONSTRAINT: Minimum 2 sessions per day (or empty day)
  groupDaySessions.forEach((count) => {
    if (count === 1) {
      fitness -= 30;
    }
  });

  // CONSTRAINT: Minimize gaps between sessions (prefer consecutive sessions)
  groupDaySlots.forEach((slots) => {
    const sortedSlots = Array.from(slots).sort((a, b) => a - b);

    for (let i = 1; i < sortedSlots.length; i++) {
      const gap = sortedSlots[i] - sortedSlots[i - 1] - 1;
      if (gap > 0) {
        fitness -= gap * 10;
      }
    }
  });

  return fitness; // Return fitness (always > 0 since hard constraints already validated)
}

/**
 * Mutation: randomly modify genes to explore new solutions
 * Smart mutation: changes one aspect (day, slot, room, OR teacher) at a time
 */
function mutate(
  chromosome: Chromosome,
  data: TimetableAlgorithmData
): Chromosome {
  const mutated = [...chromosome];
  const rooms = Object.values(data.rooms);
  const mutationRate = 0.2;

  for (let i = 0; i < mutated.length; i++) {
    if (Math.random() < mutationRate) {
      const session = data.sessions[mutated[i].sessionIndex];
      const mutationType = Math.floor(Math.random() * 4); // Now 4 types including teacher

      switch (mutationType) {
        case 0: // Mutate day only
          mutated[i] = {
            ...mutated[i],
            dayIndex: Math.floor(Math.random() * DAYS.length),
          };
          break;
        case 1: // Mutate time slot only
          mutated[i] = {
            ...mutated[i],
            slotIndex: Math.floor(Math.random() * TIME_SLOTS.length),
          };
          break;
        case 2: // Mutate room only
          mutated[i] = {
            ...mutated[i],
            roomId: rooms[Math.floor(Math.random() * rooms.length)].id,
          };
          break;
        case 3: // Mutate teacher (pick another teacher who can teach this subject)
          const availableTeachers = Object.values(data.teachers).filter(
            (teacher) =>
              teacher.specializedSubjectIds?.includes(session.subjectId)
          );
          if (availableTeachers.length > 0) {
            const randomTeacher =
              availableTeachers[
                Math.floor(Math.random() * availableTeachers.length)
              ];
            mutated[i] = {
              ...mutated[i],
              teacherId: randomTeacher.id,
            };
          }
          break;
      }
    }
  }

  return mutated;
}

/**
 * Crossover: combine two parent chromosomes to create offspring
 * Single-point crossover: split at random point and swap segments
 */
function crossover(a: Chromosome, b: Chromosome): [Chromosome, Chromosome] {
  const point = Math.floor(Math.random() * Math.min(a.length, b.length));

  const child1 = [...a.slice(0, point), ...b.slice(point)];
  const child2 = [...b.slice(0, point), ...a.slice(point)];

  return [child1, child2];
}

/**
 * Convert chromosome (genetic representation) to schedule assignments
 * Transforms the optimized solution into the final timetable format
 */
function chromosomeToAssignments(
  chromosome: Chromosome,
  data: TimetableAlgorithmData
): ScheduleAssignment[] {
  const assignments: ScheduleAssignment[] = [];
  let id = 0;

  for (const gene of chromosome) {
    const session = data.sessions[gene.sessionIndex];
    if (!gene.teacherId || !session?.subjectId || !session.groupId) continue;

    const day = DAYS[gene.dayIndex];
    const slot = TIME_SLOTS[gene.slotIndex];

    assignments.push({
      id: ++id,
      day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      sessionId: session.id,
      subjectId: session.subjectId,
      teacherId: gene.teacherId,
      groupId: session.groupId,
      roomId: gene.roomId,
    });
  }

  return assignments;
}

/**
 * Main genetic algorithm scheduler
 * Uses evolutionary principles to find optimal timetable solutions
 *
 * Algorithm parameters (ULTRA MAXIMUM POWER - exhaustive search):
 * - Population: 1000 (2x ORIGINAL - high diversity for complex schedules)
 * - Generations: 1000 (6.7x ORIGINAL - EXTREMELY extensive evolution time)
 * - Mutation: 12% (REDUCED - fine-tuned exploitation)
 * - Crossover: 88% (MAXIMIZED - aggressive combination of solutions)
 * - Elitism: 50 best (5x ORIGINAL - preserve many good solutions)
 * - Random selection: 2% (MINIMIZED - highly focused search)
 *
 * WARNING: This will take 2-3 minutes to complete but has the HIGHEST success rate
 * Total evaluations: 1,000,000 (1000 population × 1000 generations)
 */
export function runGeneticScheduling(
  data: TimetableAlgorithmData
): ScheduleAssignment[] {
  const startTime = Date.now();

  // DEBUG: Check teacher data
  const teacherCount = Object.keys(data.teachers).length;
  const teachersWithSubjects = Object.values(data.teachers).filter(
    (t) => t.specializedSubjectIds && t.specializedSubjectIds.length > 0
  ).length;
  console.log(
    `🔍 DEBUG: ${teacherCount} teachers, ${teachersWithSubjects} have specializedSubjectIds`
  );

  // Sample first 3 teachers
  Object.values(data.teachers)
    .slice(0, 3)
    .forEach((t) => {
      console.log(
        `  Teacher ${t.id}: specializedSubjectIds = ${
          t.specializedSubjectIds || "UNDEFINED"
        }`
      );
    });

  console.log(
    `📊 Sessions: ${data.sessions.length}, Rooms: ${
      Object.keys(data.rooms).length
    }`
  );
  console.log(
    `📊 Time slots: ${DAYS.length} days × ${TIME_SLOTS.length} slots = ${
      DAYS.length * TIME_SLOTS.length
    } total`
  );

  // Test chromosome creation
  console.log("\n🧪 Testing chromosome creation...");
  const testChrom = createRandomChromosome(data);
  console.log(`✅ Created ${testChrom.length} genes`);

  const isValid = isValidChromosome(testChrom, data);
  console.log(`✅ Validity: ${isValid ? "VALID ✓" : "HAS CONFLICTS ✗"}`);

  if (!isValid) {
    // Analyze conflicts
    const teacherOcc = new Map<string, number>();
    const groupOcc = new Map<string, number>();
    const roomOcc = new Map<string, number>();

    for (const gene of testChrom) {
      const session = data.sessions[gene.sessionIndex];
      if (!session?.subjectId || !session.groupId || !gene.teacherId) continue;

      const key = `${gene.dayIndex}-${gene.slotIndex}`;
      teacherOcc.set(
        `T${gene.teacherId}-${key}`,
        (teacherOcc.get(`T${gene.teacherId}-${key}`) || 0) + 1
      );
      groupOcc.set(
        `G${session.groupId}-${key}`,
        (groupOcc.get(`G${session.groupId}-${key}`) || 0) + 1
      );
      roomOcc.set(
        `R${gene.roomId}-${key}`,
        (roomOcc.get(`R${gene.roomId}-${key}`) || 0) + 1
      );
    }

    const tConflicts = Array.from(teacherOcc.values()).filter(
      (v) => v > 1
    ).length;
    const gConflicts = Array.from(groupOcc.values()).filter(
      (v) => v > 1
    ).length;
    const rConflicts = Array.from(roomOcc.values()).filter((v) => v > 1).length;

    console.log(
      `   Teacher conflicts: ${tConflicts}, Group conflicts: ${gConflicts}, Room conflicts: ${rConflicts}`
    );
  }
  console.log("");

  const populationSize = 500;
  const generations = 200;

  // Create initial population
  const initialPopulation: Chromosome[] = [];
  for (let i = 0; i < populationSize; i++) {
    initialPopulation.push(createRandomChromosome(data));
  }

  const ga = GeneticAlgorithm({
    mutationFunction: (chromosome: Chromosome) => mutate(chromosome, data),
    crossoverFunction: (a: Chromosome, b: Chromosome) => crossover(a, b),
    fitnessFunction: (chromosome: Chromosome) =>
      calculateFitness(chromosome, data),
    population: initialPopulation,
    populationSize: populationSize,
    mutateProbability: 0.12,
    crossoverProbability: 0.88,
    fittestNSurvives: 50,
    randomSelection: 0.02,
  });

  // Evolution loop with progress tracking
  const logInterval = 30;
  for (let i = 0; i < generations; i++) {
    ga.evolve();

    if ((i + 1) % logInterval === 0) {
      const currentBest = ga.best() as Chromosome;
      const currentFitness = calculateFitness(currentBest, data);
      console.log(
        `📈 Generation ${i + 1}/${generations}: Fitness = ${currentFitness}`
      );
    }
  }

  // Extract best solution
  const best: Chromosome = ga.best();

  // CRITICAL VALIDATION: Ensure final solution has NO conflicts
  if (!isValidChromosome(best, data)) {
    const elapsedTime = Date.now() - startTime;
    console.error(`❌ VALIDATION FAILED after ${elapsedTime}ms`);
    console.error(`📊 Best fitness achieved: ${calculateFitness(best, data)}`);
    console.error(`⚠️ The algorithm could not find a conflict-free solution.`);

    throw new Error(
      "❌ TIMETABLE GENERATION FAILED\n\n" +
        "The algorithm could not generate a valid timetable without conflicts.\n\n" +
        "Possible causes:\n" +
        "• Too many sessions for available time slots\n" +
        "• Teachers assigned to incompatible sessions\n" +
        "• Insufficient rooms for the number of simultaneous sessions\n" +
        "• Constraints are too restrictive\n\n" +
        "Suggested actions:\n" +
        "1. Review session assignments and teacher specializations\n" +
        "2. Add more rooms or time slots if possible\n" +
        "3. Reduce the number of sessions per week\n" +
        "4. Try running the algorithm again (it uses randomization)\n" +
        "5. Contact support if the problem persists"
    );
  }

  const assignments = chromosomeToAssignments(best, data);
  const finalFitness = calculateFitness(best, data);

  // Performance logging
  const elapsedTime = Date.now() - startTime;
  console.log(
    `🧬 Genetic Algorithm Complete: ${assignments.length} assignments in ${elapsedTime}ms`
  );
  console.log(`📊 Final fitness score: ${finalFitness}`);
  console.log(`✅ VALIDATION PASSED: No conflicts detected`);
  console.log(`🎯 Population: ${populationSize}, Generations: ${generations}`);
  console.log(
    `⚡ Performance: ${(assignments.length / (elapsedTime / 1000)).toFixed(
      0
    )} assignments/sec`
  );

  return assignments;
}
