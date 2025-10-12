// Minimal TypeScript interfaces for runtime validation and developer ergonomics
export interface School {
  id: number;
  name: string;
  address?: string | null;
}

export interface Teacher {
  id: number;
  lastName?: string | null;
  firstName?: string | null;
  schoolId: number;
}

export interface Subject {
  id: number;
  name: string;
  hourVolume: string | number; // DB uses decimal stored as string by PG client sometimes
  schoolId: number;
}

export interface Group {
  id: number;
  specializationId?: number | null;
  level?: string | null;
  departmentId?: number | null;
  schoolId: number;
}

export interface Session {
  id: number;
  subjectId: number | null;
  teacherId: number | null;
  groupId: number | null;
}

export interface Administrator {
  id: number;
  username: string;
  passwordHash: string;
  schoolId: number;
}

export interface DepartmentSimple {
  id: number;
  name: string;
  schoolId: number;
}

export interface SpecializationSimple {
  id: number;
  name: string;
  schoolId: number;
}

export interface RoomSimple {
  id: number;
  name?: string | null;
  capacity?: number | null;
  schoolId: number;
}

export interface AssembledPayload {
  school: School | null;
  administrators: Administrator[];
  departments: DepartmentSimple[];
  subjects: Subject[];
  specializations: SpecializationSimple[];
  teachers: Teacher[];
  groups: Group[];
  sessions: Session[];
  rooms: RoomSimple[];
}

// runtime guards (shallow)
export function isAssembledPayload(x: unknown): x is AssembledPayload {
  return (
    !!x &&
    typeof x === "object" &&
    "subjects" in x &&
    "teachers" in x &&
    "sessions" in x
  );
}
