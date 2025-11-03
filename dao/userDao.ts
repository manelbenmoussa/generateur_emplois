import type { Prisma, UserRole } from "@prisma/client";
import prisma from "./db";

// User with optional teacher/student relations
export type UserWithProfile = Prisma.UserGetPayload<{
  include: { teacher: true; student: true };
}>;

/**
 * Get all users, optionally filtered by role
 */
export async function getUsers(role?: UserRole): Promise<UserWithProfile[]> {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    include: {
      teacher: true,
      student: true,
    },
  });
}

/**
 * Get all teacher users (role = TEACHER)
 */
export async function getTeacherUsers(schoolId?: number) {
  return prisma.user.findMany({
    where: {
      role: "TEACHER",
      teacher: schoolId ? { schoolId } : { isNot: null },
    },
    include: {
      teacher: {
        include: {
          subjects: true,
        },
      },
    },
  });
}

/**
 * Get all student users (role = STUDENT)
 */
export async function getStudentUsers(schoolId?: number) {
  return prisma.user.findMany({
    where: {
      role: "STUDENT",
      student: schoolId ? { schoolId } : { isNot: null },
    },
    include: {
      student: {
        include: {
          group: true,
        },
      },
    },
  });
}

/**
 * Get user by ID with profile data
 */
export async function getUserById(id: string): Promise<UserWithProfile | null> {
  return prisma.user.findUnique({
    where: { id },
    include: {
      teacher: true,
      student: true,
    },
  });
}

/**
 * Get user by email
 */
export async function getUserByEmail(
  email: string
): Promise<UserWithProfile | null> {
  return prisma.user.findUnique({
    where: { email },
    include: {
      teacher: true,
      student: true,
    },
  });
}

/**
 * Create a new user (for authentication)
 */
export async function createUser(data: {
  email: string;
  password?: string;
  name?: string;
  role: UserRole;
  image?: string;
}) {
  return prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      image: data.image,
    },
  });
}

/**
 * Update user data
 */
export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    image?: string;
  }
) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

/**
 * Delete user (cascades to teacher/student)
 */
export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}
