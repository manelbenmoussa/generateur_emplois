import type { Decimal } from "@prisma/client/runtime/library";
import * as schoolDao from "../dao/schoolDao";
import * as departmentDao from "../dao/departmentDao";
import * as subjectDao from "../dao/subjectDao";
import * as specializationDao from "../dao/specializationDao";
import * as teacherDao from "../dao/teacherDao";
import * as groupDao from "../dao/groupDao";
import * as sessionDao from "../dao/sessionDao";
import * as roomDao from "../dao/roomDao";
import * as scheduleConfigDao from "../dao/scheduleConfigDao";

/**
 * Generic type definitions for database entities
 * These match Prisma model shapes but don't depend on Prisma types
 * This decouples DTOs from database implementation
 */
type DatabaseSchool = {
  id: number;
  name: string;
  address?: string | null;
};

type DatabaseDepartment = {
  id: number;
  name: string;
  schoolId: number;
};

type DatabaseSubject = {
  id: number;
  name: string;
  hourVolume: Decimal;
};

type DatabaseSpecialization = {
  id: number;
  name: string;
  departmentId: number;
};

type DatabaseTeacher = {
  id: number;
  userId: string;
  schoolId: number;
  user?: {
    id: string;
    name?: string | null;
    email: string;
  };
  // When joined with expertSubjects
  expertSubjects?: Array<{ subjectId?: number; subject_id?: number }>;
};

type DatabaseGroup = {
  id: number;
  specializationId: number;
  level?: string | null;
};

type DatabaseSession = {
  id: number;
  subjectId: number;
  teacherId?: number | null;
  groupId: number;
  // When DAO includes the group relation
  group?: { id: number };
};

type DatabaseRoom = {
  id: number;
  name?: string | null;
  capacity?: number | null;
  schoolId: number;
};

export interface SchoolDto {
  name: string;
  address?: string | null;
}

export interface AdministratorDto {
  id: number;
  name?: string | null;
  email?: string | null;
}

export interface DepartmentDto {
  id: number;
  name: string;
}

export interface SubjectDto {
  id: number;
  name: string;
  hourVolume: number | null;
}

export interface SpecializationDto {
  id: number;
  name: string;
}

export interface TeacherDto {
  id: number;
  name?: string | null;
  email?: string | null;
  // list of subject ids the teacher is specialized in (populated when DAO includes join)
  specializedSubjectIds?: number[];
  maxWeeklyHours?: number | null;
}

export interface GroupDto {
  id: number;
  specializationId: number;
  level?: string | null;
}

export interface SessionDto {
  id: number;
  subjectId: number;
  teacherId?: number | null;
  groupId: number;
}

export interface RoomDto {
  id: number;
  name?: string | null;
  capacity?: number | null;
}

export type ScheduleConfigDto = {
  days: string;
  timeSlots: string;
};

export type AssembledPayloadDto = {
  school: SchoolDto | null;
  scheduleConfig: ScheduleConfigDto | null;
  departments: DepartmentDto[];
  subjects: SubjectDto[];
  specializations: SpecializationDto[];
  teachers: TeacherDto[];
  groups: GroupDto[];
  sessions: SessionDto[];
  rooms: RoomDto[];
};

// small helpers
function toNumber(v: unknown): number | null {
  if (v == null) return null;
  // handle Prisma Decimal
  if (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Decimal).toNumber === "function"
  ) {
    return (v as Decimal).toNumber();
  }
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
// mappers: pick and normalize only the fields algorithm needs

export function mapSchool(raw: DatabaseSchool): SchoolDto {
  return {
    name: raw.name,
    address: raw.address,
  };
}

export function mapDepartment(raw: DatabaseDepartment): DepartmentDto {
  return {
    id: raw.id,
    name: raw.name,
  };
}

export function mapSubject(raw: DatabaseSubject): SubjectDto {
  return {
    id: raw.id,
    name: raw.name,
    hourVolume: toNumber(raw.hourVolume),
  };
}

export function mapSpecialization(
  raw: DatabaseSpecialization
): SpecializationDto {
  return {
    id: raw.id,
    name: raw.name,
  };
}

export function mapTeacher(raw: DatabaseTeacher): TeacherDto {
  // The DAO may include a join table shape like { subjectId } or { subject_id }.
  type SpecializationRow = { subjectId?: number; subject_id?: number };

  // The DAO might return the join under different property names depending on the query
  // Accept either `expertSubjects` or `subjects` and normalize both shapes.
  const typed = raw as unknown as {
    expertSubjects?: SpecializationRow[];
    subjects?: SpecializationRow[];
    maxWeeklyHours?: number | null;
  };

  const joinRows = Array.isArray(typed.expertSubjects)
    ? typed.expertSubjects
    : Array.isArray(typed.subjects)
    ? typed.subjects
    : undefined;

  const specializedSubjectIds: number[] = Array.isArray(joinRows)
    ? joinRows
        .map((s) => {
          const id = s?.subjectId ?? s?.subject_id;
          return id != null ? Number(id) : undefined;
        })
        .filter((id): id is number => id !== undefined)
    : [];

  return {
    id: raw.id,
    name: raw.user?.name,
    email: raw.user?.email,
    specializedSubjectIds: specializedSubjectIds.length
      ? specializedSubjectIds
      : undefined,
    maxWeeklyHours:
      (raw as { maxWeeklyHours?: number | null }).maxWeeklyHours ?? null,
  };
}

export function mapGroup(raw: DatabaseGroup): GroupDto {
  return {
    id: raw.id,
    specializationId: raw.specializationId,
    level: raw.level,
  };
}

export function mapSession(raw: DatabaseSession): SessionDto {
  return {
    id: raw.id,
    subjectId: raw.subjectId,
    teacherId: raw.teacherId,
    groupId: raw.groupId,
  };
}

export function mapRoom(raw: DatabaseRoom): RoomDto {
  return {
    id: raw.id,
    name: raw.name,
    capacity: raw.capacity,
  };
}

export function isAssembledPayloadDto(x: unknown): x is AssembledPayloadDto {
  return (
    !!x &&
    typeof x === "object" &&
    "subjects" in x &&
    "teachers" in x &&
    "sessions" in x
  );
}

export async function assembleAllEntitiesForSchool(
  schoolId: number
): Promise<AssembledPayloadDto> {
  const [
    schoolRaw,
    scheduleConfigRaw,
    departmentsRaw,
    subjectsRaw,
    specializationsRaw,
    teachersRaw,
    groupsRaw,
    sessionsRaw,
    roomsRaw,
  ] = await Promise.all([
    (await schoolDao.getSchoolById(schoolId)) || null,
    scheduleConfigDao.getScheduleConfigBySchool(schoolId),
    departmentDao.getDepartmentsBySchool(schoolId),
    subjectDao.getSubjectsBySchool(schoolId),
    specializationDao.getSpecializationsBySchool(schoolId),
    teacherDao.getTeachersBySchool(schoolId),
    groupDao.getGroupsBySchool(schoolId),
    sessionDao.getSessionsBySchool(schoolId),
    roomDao.getRoomsBySchool(schoolId),
  ]);

  const scheduleConfig = scheduleConfigRaw
    ? { days: scheduleConfigRaw.days, timeSlots: scheduleConfigRaw.timeSlots }
    : null;

  return {
    school: schoolRaw ? mapSchool(schoolRaw) : null,
    scheduleConfig,
    departments: (departmentsRaw ?? []).map(mapDepartment),
    subjects: (subjectsRaw ?? []).map(mapSubject),
    specializations: (specializationsRaw ?? []).map(mapSpecialization),
    teachers: (teachersRaw ?? []).map(mapTeacher),
    groups: (groupsRaw ?? []).map(mapGroup),
    sessions: (sessionsRaw ?? []).map(mapSession),
    rooms: (roomsRaw ?? []).map(mapRoom),
  };
}

export interface TimetableAlgorithmData {
  subjects: Record<number, SubjectDto>;
  teachers: Record<number, TeacherDto>;
  groups: Record<number, GroupDto>;
  rooms: Record<number, RoomDto>;
  sessions: SessionDto[]; // sessions are the core "to-be-scheduled" items
}

export function transformDataForAlgorithm(
  payload: AssembledPayloadDto
): TimetableAlgorithmData {
  const idMapper = <T extends { id: number }>(items: T[]): Record<number, T> =>
    items.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<number, T>);

  return {
    subjects: idMapper(payload.subjects),
    teachers: idMapper(payload.teachers),
    groups: idMapper(payload.groups),
    rooms: idMapper(payload.rooms),
    sessions: payload.sessions,
  };
}
