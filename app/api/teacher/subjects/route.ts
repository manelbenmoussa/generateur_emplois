import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/dao/db";
import * as teacherDao from "@/dao/teacherDao";

// GET: return available subjects for the teacher's school and currently assigned subjects
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Build grouped structure: departments -> specializations -> subjects
    const departments = await prisma.department.findMany({
      where: { schoolId: teacher.schoolId },
      include: { specializations: true },
      orderBy: { name: "asc" },
    });

    // Find sessions for this school to discover which subjects are used per specialization
    const sessions = await prisma.session.findMany({
      where: {
        group: {
          specialization: {
            department: { schoolId: teacher.schoolId },
          },
        },
      },
      include: {
        subject: true,
        group: { include: { specialization: true } },
      },
    });

    // Map specializationId -> Set of subjects
    const specSubjects = new Map<
      number,
      Map<number, { id: number; name: string; hourVolume: number | null }>
    >();
    for (const s of sessions) {
      const spec = s.group?.specialization;
      if (!spec || !s.subject) continue;
      const subj = { id: s.subject.id, name: s.subject.name };
      const mapForSpec = specSubjects.get(spec.id) ?? new Map();
      mapForSpec.set(subj.id, subj);
      specSubjects.set(spec.id, mapForSpec);
    }

    // Build final grouped departments structure
    const grouped = departments.map((d) => ({
      id: d.id,
      name: d.name,
      specializations: (d.specializations || []).map((sp) => ({
        id: sp.id,
        name: sp.name,
        subjects: Array.from(specSubjects.get(sp.id)?.values() || []),
      })),
    }));

    // Get assigned subject ids
    const assigned = await prisma.teacherSubject.findMany({
      where: { teacherId: teacher.id },
      select: { subjectId: true },
    });
    const assignedIds = assigned.map((a) => a.subjectId);

    return NextResponse.json({
      departments: grouped,
      assignedSubjectIds: assignedIds,
    });
  } catch (err) {
    const message = err?.message ?? String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: update teacher's assigned subjects
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const subjectIds: number[] | undefined = body.subjectIds;

    if (!Array.isArray(subjectIds)) {
      return NextResponse.json(
        { error: "subjectIds must be an array" },
        { status: 400 }
      );
    }

    // Use teacherDao.updateTeacher to sync the join table
    const updated = await teacherDao.updateTeacher(teacher.id, { subjectIds });

    return NextResponse.json({ message: "Updated", teacher: updated });
  } catch (err) {
    const message = err?.message ?? String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
