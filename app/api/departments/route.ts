import { NextRequest, NextResponse } from "next/server";
import {
  getDepartmentsBySchool,
  getDepartmentByName,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/dao/departmentDao";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 }
      );
    }

    const departments = await getDepartmentsBySchool(parseInt(schoolId));
    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, schoolId } = body;

    if (!name || !schoolId) {
      return NextResponse.json(
        { error: "name and schoolId are required" },
        { status: 400 }
      );
    }

    // Check for duplicate department name in the same school
    const existing = await getDepartmentByName(name, parseInt(schoolId));

    if (existing) {
      return NextResponse.json(
        { error: "A department with this name already exists in this school" },
        { status: 409 }
      );
    }

    const department = await createDepartment({
      name,
      schoolId: parseInt(schoolId),
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, schoolId } = body;

    if (!id || !name || !schoolId) {
      return NextResponse.json(
        { error: "id, name, and schoolId are required" },
        { status: 400 }
      );
    }

    // Check for duplicate department name in the same school (excluding current department)
    const existing = await getDepartmentByName(name, parseInt(schoolId));

    if (existing && existing.id !== parseInt(id)) {
      return NextResponse.json(
        { error: "A department with this name already exists in this school" },
        { status: 409 }
      );
    }

    const department = await updateDepartment(parseInt(id), { name });

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await deleteDepartment(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}
