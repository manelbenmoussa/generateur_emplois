import { NextRequest, NextResponse } from "next/server";
import prisma from "@/dao/db";

function normalizeSubjectName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim();
  try {
    return trimmed.normalize("NFKC");
  } catch {
    return trimmed;
  }
}
import { Prisma } from "@prisma/client";

// GET: Fetch all subjects (global)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkName = searchParams.get("checkName");
    if (checkName) {
      // normalize then check DB for case-insensitive match
      const normalized = normalizeSubjectName(checkName) ?? checkName;
      // normalized subject check (log removed)
      const matches = await prisma.subject.findMany({
        where: {
          name: { equals: normalized, mode: "insensitive" },
        },
      });
      return NextResponse.json({ matches });
    }
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

// POST: Create a new subject (global)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { name } = body;
    // Normalize name for comparison and storage to avoid invisible char or whitespace duplicates
    const normalized = normalizeSubjectName(name);
    if (normalized) name = normalized;
    // creating subject (debug log removed)
    const { hourVolume } = body;
    // Trim name to avoid duplicates caused by trailing/leading spaces
    name = typeof name === "string" ? name.trim() : name;

    // Validation — produce fieldErrors object for client-side field display
    const fieldErrors: Record<string, string> = {};
    if (!name || String(name).trim() === "") {
      fieldErrors.name = "Name is required.";
    }
    if (
      hourVolume === undefined ||
      hourVolume === null ||
      String(hourVolume).trim() === ""
    ) {
      fieldErrors.hourVolume = "Hour volume is required.";
    }
    const hours = parseFloat(String(hourVolume));
    if (!fieldErrors.hourVolume && (isNaN(hours) || hours <= 0)) {
      fieldErrors.hourVolume = "hourVolume must be a positive number";
    }
    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { fieldErrors, error: "Validation failed" },
        { status: 400 }
      );
    }

    // Check for duplicate subject name (global)
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
    if (existingSubject) {
      console.warn(
        "Duplicate subject create attempt for name:",
        JSON.stringify(name),
        "existingId:",
        existingSubject.id,
        "existingName:",
        JSON.stringify(existingSubject.name)
      );
    }
    if (existingSubject) {
      console.warn(
        "Duplicate subject create attempt for name:",
        name,
        "existingId:",
        existingSubject.id
      );
    }

    if (existingSubject) {
      return NextResponse.json(
        {
          fieldErrors: { name: "A subject with this name already exists" },
          error: "Duplicate subject",
        },
        { status: 409 }
      );
    }

    let newSubject;
    try {
      newSubject = await prisma.subject.create({
        data: {
          name,
          hourVolume: hours,
        },
      });
    } catch (err) {
      // Handle unique constraint violation
      if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2002") {
        return NextResponse.json(
          {
            fieldErrors: { name: "A subject with this name already exists" },
            error: "Duplicate subject",
          },
          { status: 409 }
        );
      }
      console.error("Error creating subject (db):", err);
      return NextResponse.json(
        { error: "Failed to create subject" },
        { status: 500 }
      );
    }

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}

// PUT: Update a subject (global)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, hourVolume } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: parseInt(String(id)) },
    });

    if (existingSubject) {
      console.warn(
        "Duplicate subject create attempt for name:",
        JSON.stringify(name),
        "existingId:",
        existingSubject.id,
        "existingName:",
        JSON.stringify(existingSubject.name),
        "existingRecord:",
        existingSubject
      );
    }

    // Check for duplicate name (excluding current subject)
    const fieldErrors: Record<string, string> = {};
    if (name) {
      const duplicate = await prisma.subject.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
          NOT: {
            id: parseInt(String(id)),
          },
        },
      });
      if (duplicate) {
        console.warn(
          "Duplicate subject update attempt for name:",
          name,
          "duplicateId:",
          duplicate.id
        );
        // Return the existing subject object when update attempts collide
        return NextResponse.json(
          { existingSubject: existingSubject },
          { status: 409 }
        );
      }

      if (duplicate) {
        return NextResponse.json(
          {
            fieldErrors: { name: "A subject with this name already exists" },
            error: "Duplicate subject",
            existingSubject: duplicate,
          },
          { status: 409 }
        );
      }
    }

    const updateData: {
      name?: string;
      hourVolume?: number;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (hourVolume !== undefined) {
      const hours = parseFloat(String(hourVolume));
      if (isNaN(hours) || hours <= 0) {
        fieldErrors.hourVolume = "hourVolume must be a positive number";
      } else {
        updateData.hourVolume = hours;
      }
    }
    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { fieldErrors, error: "Validation failed" },
        { status: 400 }
      );
    }

    let updatedSubject;
    try {
      updatedSubject = await prisma.subject.update({
        where: { id: parseInt(String(id)) },
        data: updateData,
      });
    } catch (err) {
      if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2002") {
        return NextResponse.json(
          {
            fieldErrors: { name: "A subject with this name already exists" },
            error: "Duplicate subject",
          },
          { status: 409 }
        );
      }
      console.error("Error updating subject (db):", err);
      return NextResponse.json(
        { error: "Failed to update subject" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a subject
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const subjectId = parseInt(id);

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check if subject is used in sessions
    const sessionsCount = await prisma.session.count({
      where: { subjectId },
    });

    if (sessionsCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete subject. It is used in ${sessionsCount} session(s)`,
        },
        { status: 409 }
      );
    }

    // Check if subject is assigned to teachers
    const teachersCount = await prisma.teacherSubject.count({
      where: { subjectId },
    });

    if (teachersCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete subject. It is assigned to ${teachersCount} teacher(s)`,
        },
        { status: 409 }
      );
    }

    await prisma.subject.delete({
      where: { id: subjectId },
    });

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
