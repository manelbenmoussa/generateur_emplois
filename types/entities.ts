// Minimal TypeScript interfaces for runtime validation and developer ergonomics
export interface School {
  id: number;
  name: string;
  address?: string | null;
}

export interface User {
  id: string;
  name?: string | null;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  image?: string | null;
}

export interface Administrator {
  id: number;
  schoolId: number;
  userId: string;
  user?: User;
  school?: School;
}

export interface Teacher {
  id: number;
  schoolId: number;
  userId: string;
  user?: User;
  school?: School;
}

export interface Subject {
  id: number;
  name: string;
  hourVolume: string | number; // DB uses decimal stored as string by PG client sometimes
  departmentId: number;
  department?: {
    id: number;
    name: string;
  };
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

export interface Student {
  id: number;
  schoolId: number;
  groupId: number | null;
  userId: string;
  user?: User;
  school?: School;
}

export interface DepartmentSimple {
  id: number;
  name: string;
  schoolId: number;
}

export interface Department {
  id: number;
  name: string;
  schoolId: number;
}

export interface SpecializationSimple {
  id: number;
  name: string;
  schoolId: number;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  schoolId: number;
  departmentId: number | null;
  department?: Department | null;
  school?: School;
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
  rooms: Room[];
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
