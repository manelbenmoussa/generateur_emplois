import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/dao/db";

// GET /api/student/payments
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const payments = await prisma.payment.findMany({
      where: {
        studentId: student.id,
      },
      orderBy: {
        dueDate: "desc",
      },
    });

    // Calculate totals
    const totalAmount = payments.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0
    );
    const paidAmount = payments
      .filter((p: any) => p.status === "PAID")
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const pendingAmount = totalAmount - paidAmount;

    return NextResponse.json({
      payments,
      summary: {
        totalAmount,
        paidAmount,
        pendingAmount,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
