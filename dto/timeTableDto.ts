import * as schoolDao from "../dao/schoolDao";
import * as administratorDao from "../dao/administratorDao";
import * as departmentDao from "../dao/departmentDao";
import * as subjectDao from "../dao/subjectDao";
import * as specializationDao from "../dao/specializationDao";
import * as teacherDao from "../dao/teacherDao";
import * as groupDao from "../dao/groupDao";
import * as sessionDao from "../dao/sessionDao";
import * as roomDao from "../dao/roomDao";

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

type DatabaseAdministrator = {
  id: number;
  username: string;
  passwordHash: string;
  schoolId: number;
};

type DatabaseDepartment = {
  id: number;
  name: string;
  schoolId: number;
};

type DatabaseSubject = {
  id: number;
  name: string;
  hourVolume: unknown; // Prisma Decimal type
  departmentId: number;
};

type DatabaseSpecialization = {
  id: number;
  name: string;
  departmentId: number;
};

type DatabaseTeacher = {
  id: number;
  lastName?: string | null;
  firstName?: string | null;
  schoolId: number;
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
  // Groups are now many-to-many through GroupSession
  groups?: Array<{ group: { id: number } }>;
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
  username: string;
  // email is optional and sanitized
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
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  // list of subject ids the teacher is specialized in (populated when DAO includes join)
  specializedSubjectIds?: number[];
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
  groupId?: number | null; // For algorithm compatibility, we'll extract the first group
  groupIds?: number[]; // All groups this session belongs to
}

export interface RoomDto {
  id: number;
  name?: string | null;
  capacity?: number | null;
}

export interface AssembledPayloadDto {
  school: SchoolDto | null;
  administrators: AdministratorDto[];
  departments: DepartmentDto[];
  subjects: SubjectDto[];
  specializations: SpecializationDto[];
  teachers: TeacherDto[];
  groups: GroupDto[];
  sessions: SessionDto[];
  rooms: RoomDto[];
}

// small helpers
function toNumber(v: unknown): number | null {
  if (v == null) return null;
  // handle Prisma Decimal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyV: any = v;
  if (typeof anyV === "object" && typeof anyV.toNumber === "function") {
    return anyV.toNumber();
  }
  const n = Number(anyV);
  return Number.isNaN(n) ? null : n;
}
// mappers: pick and normalize only the fields algorithm needs

export function mapSchool(raw: DatabaseSchool): SchoolDto {
  return {
    name: raw.name,
    address: raw.address,
  };
}

export function mapAdministrator(raw: DatabaseAdministrator): AdministratorDto {
  return {
    id: raw.id,
    username: raw.username,
    // email is not on the prisma model
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

  const typed = raw as unknown as { expertSubjects?: SpecializationRow[] };
  const specializedSubjectIds: number[] = Array.isArray(typed.expertSubjects)
    ? typed.expertSubjects
        .map((s) => {
          const id = s?.subjectId ?? s?.subject_id;
          return id != null ? Number(id) : undefined;
        })
        .filter((id): id is number => id !== undefined)
    : [];

  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    // email is not on the prisma model
    specializedSubjectIds: specializedSubjectIds.length
      ? specializedSubjectIds
      : undefined,
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
  // Extract group IDs from the many-to-many relationship
  const groupIds = raw.groups?.map((g) => g.group.id) || [];

  return {
    id: raw.id,
    subjectId: raw.subjectId,
    teacherId: raw.teacherId,
    groupId: groupIds[0] || null, // For algorithm compatibility, use first group
    groupIds: groupIds.length > 0 ? groupIds : undefined,
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
    administratorsRaw,
    departmentsRaw,
    subjectsRaw,
    specializationsRaw,
    teachersRaw,
    groupsRaw,
    sessionsRaw,
    roomsRaw,
  ] = await Promise.all([
    (await schoolDao.getSchoolById(schoolId)) || null,
    administratorDao.getAdministratorsBySchool(schoolId),
    departmentDao.getDepartmentsBySchool(schoolId),
    subjectDao.getSubjectsBySchool(schoolId),
    specializationDao.getSpecializationsBySchool(schoolId),
    teacherDao.getTeachersBySchool(schoolId),
    groupDao.getGroupsBySchool(schoolId),
    sessionDao.getSessionsBySchool(schoolId),
    roomDao.getRoomsBySchool(schoolId),
  ]);

  return {
    school: schoolRaw ? mapSchool(schoolRaw) : null,
    administrators: (administratorsRaw ?? []).map(mapAdministrator),
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
    sessions: payload.sessions, // sessions are not mapped by id, they are the list of events to schedule
  };
}
