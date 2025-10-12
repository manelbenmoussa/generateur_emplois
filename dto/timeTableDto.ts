import * as schoolDao from "../dao/schoolDao";
import * as administratorDao from "../dao/administratorDao";
import * as departmentDao from "../dao/departmentDao";
import * as subjectDao from "../dao/subjectDao";
import * as specializationDao from "../dao/specializationDao";
import * as teacherDao from "../dao/teacherDao";
import * as groupDao from "../dao/groupDao";
import * as sessionDao from "../dao/sessionDao";
import * as roomDao from "../dao/roomDao";

import type {
  School,
  Administrator,
  Department,
  Subject,
  Specialization,
  Teacher,
  Group,
  Session,
  Room,
} from "@prisma/client";

export interface SchoolDto {
  id: number;
  name: string;
  address?: string | null;
}

export interface AdministratorDto {
  id: number;
  username: string;
  // email is optional and sanitized
  email?: string | null;
  schoolId: number;
}

export interface DepartmentDto {
  id: number;
  name: string;
  schoolId: number;
}

export interface SubjectDto {
  id: number;
  name: string;
  hourVolume: number | null;
  schoolId: number;
}

export interface SpecializationDto {
  id: number;
  name: string;
  schoolId: number;
}

export interface TeacherDto {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  schoolId: number;
}

export interface GroupDto {
  id: number;
  specializationId?: number | null;
  level?: string | null;
  departmentId?: number | null;
  schoolId: number;
}

export interface SessionDto {
  id: number;
  subjectId?: number | null;
  teacherId?: number | null;
  groupId?: number | null;
}

export interface RoomDto {
  id: number;
  name?: string | null;
  capacity?: number | null;
  schoolId: number;
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

export function mapSchool(raw: School): SchoolDto {
  return {
    id: raw.id,
    name: raw.name,
    address: raw.address,
  };
}

export function mapAdministrator(raw: Administrator): AdministratorDto {
  return {
    id: raw.id,
    username: raw.username,
    // email is not on the prisma model
    schoolId: raw.schoolId,
  };
}

export function mapDepartment(raw: Department): DepartmentDto {
  return {
    id: raw.id,
    name: raw.name,
    schoolId: raw.schoolId,
  };
}

export function mapSubject(raw: Subject): SubjectDto {
  return {
    id: raw.id,
    name: raw.name,
    hourVolume: toNumber(raw.hourVolume),
    schoolId: raw.schoolId,
  };
}

export function mapSpecialization(raw: Specialization): SpecializationDto {
  return {
    id: raw.id,
    name: raw.name,
    schoolId: raw.schoolId,
  };
}

export function mapTeacher(raw: Teacher): TeacherDto {
  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    // email is not on the prisma model
    schoolId: raw.schoolId,
  };
}

export function mapGroup(raw: Group): GroupDto {
  return {
    id: raw.id,
    specializationId: raw.specializationId,
    level: raw.level,
    departmentId: raw.departmentId,
    schoolId: raw.schoolId,
  };
}

export function mapSession(raw: Session): SessionDto {
  return {
    id: raw.id,
    subjectId: raw.subjectId,
    teacherId: raw.teacherId,
    groupId: raw.groupId,
  };
}

export function mapRoom(raw: Room): RoomDto {
  return {
    id: raw.id,
    name: raw.name,
    capacity: raw.capacity,
    schoolId: raw.schoolId,
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
