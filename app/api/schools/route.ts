import { NextResponse } from "next/server";
import prisma from "@/dao/db";

// GET /api/schools - Get all schools
export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        address: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(schools);
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}

// POST /api/schools - Create a new school
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address } = body;

    if (!name) {
      return NextResponse.json(
        { error: "School name is required" },
        { status: 400 }
      );
    }

    // Check for duplicate school name
    const existing = await prisma.school.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A school with this name already exists" },
        { status: 409 }
      );
    }

    const school = await prisma.school.create({
      data: {
        name,
        address: address || null,
      },
    });

    return NextResponse.json(school, { status: 201 });
  } catch (error) {
    console.error("Error creating school:", error);
    return NextResponse.json(
      { error: "Failed to create school" },
      { status: 500 }
    );
  }
}
