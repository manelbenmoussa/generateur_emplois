import GeneticAlgorithm from "geneticalgorithm";
import type { TimetableAlgorithmData } from "../dto/timeTableDto";
import type { ScheduleAssignment } from "../utils/pdfGenerator";
import { DAYS, TIME_SLOTS, MAX_TEACHER_HOURS } from "../constants/schedule";

/**
 * Gene: represents a single scheduled session assignment
 * Each gene contains the session, its day, time slot, and assigned room
 */
interface Gene {
  sessionIndex: number; // Index in data.sessions array
  dayIndex: number; // Day index (0-4 for Mon-Fri)
  slotIndex: number; // Time slot index (0-5)
  roomId: number; // Assigned room ID
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
 * Randomly assigns each session to a day, time slot, and room
 */
function createRandomChromosome(data: TimetableAlgorithmData): Chromosome {
  const chromosome: Chromosome = [];
  const rooms = Object.values(data.rooms);

  for (
    let sessionIndex = 0;
    sessionIndex < data.sessions.length;
    sessionIndex++
  ) {
    const slotsNeeded = getSlotsNeeded(data, sessionIndex);

    for (let i = 0; i < slotsNeeded; i++) {
      chromosome.push({
        sessionIndex,
        dayIndex: Math.floor(Math.random() * DAYS.length),
        slotIndex: Math.floor(Math.random() * TIME_SLOTS.length),
        roomId: rooms[Math.floor(Math.random() * rooms.length)].id,
      });
    }
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
    if (!session?.teacherId || !session.subjectId || !session.groupId) {
      return false; // Invalid session data
    }

    const key = `${gene.dayIndex}-${gene.slotIndex}`;
    const teacherKey = `T${session.teacherId}-${key}`;
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
    if (!session?.teacherId || !session.subjectId || !session.groupId) continue;

    const subject = data.subjects[session.subjectId];
    if (!subject) continue; // Track teacher hours
    const currentHours = teacherHours.get(session.teacherId) || 0;
    teacherHours.set(session.teacherId, currentHours + 1.5);

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
 * Smart mutation: changes only one aspect (day, slot, or room) at a time
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
      const mutationType = Math.floor(Math.random() * 3);

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
    if (!session?.teacherId || !session.subjectId || !session.groupId) continue;

    const day = DAYS[gene.dayIndex];
    const slot = TIME_SLOTS[gene.slotIndex];

    assignments.push({
      id: ++id,
      day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      sessionId: session.id,
      subjectId: session.subjectId,
      teacherId: session.teacherId,
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
 * Algorithm parameters (production-optimized):
 * - Population: 500 (high diversity for better solutions)
 * - Generations: 150 (sufficient for convergence)
 * - Mutation: 20% (lower rate due to large population diversity)
 * - Crossover: 80% (high exploitation of good solutions)
 * - Elitism: 10 best (top 2% survive each generation)
 * - Random selection: 5% (focused search)
 */
export function runGeneticScheduling(
  data: TimetableAlgorithmData
): ScheduleAssignment[] {
  const startTime = Date.now();

  const populationSize = 500;
  const generations = 150;

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
    mutateProbability: 0.2,
    crossoverProbability: 0.8,
    fittestNSurvives: 10,
    randomSelection: 0.05,
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
