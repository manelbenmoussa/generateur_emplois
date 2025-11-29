import { NextResponse } from "next/server";
import * as scheduleConfigDao from "@/dao/scheduleConfigDao";

export async function GET() {
  try {
    // TODO: replace with session-based schoolId
    const schoolId = 1;
    const config = await scheduleConfigDao.getScheduleConfigBySchool(schoolId);
    if (!config) {
      return NextResponse.json({ scheduleConfig: null });
    }
    // return parsed JSON for client (we persist strings in DB but UI wants arrays)
    const safeParse = (s: string) => {
      try {
        return JSON.parse(s);
      } catch {
        return s;
      }
    };
    const days = safeParse(config.days);
    const timeSlots = safeParse(config.timeSlots);
    return NextResponse.json({ scheduleConfig: { days, timeSlots } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const schoolId = 1; // TODO: use auth session
    const body = await req.json();
    let { days, timeSlots } = body;
    // Accept both arrays and stringified JSON
    if (typeof days !== "string") {
      days = JSON.stringify(days || []);
    }
    if (typeof timeSlots !== "string") {
      timeSlots = JSON.stringify(timeSlots || []);
    }
    // Persist: convert arrays to JSON strings if needed
    const daysStr =
      typeof days === "string" ? days : JSON.stringify(days || []);
    const timeSlotsStr =
      typeof timeSlots === "string"
        ? timeSlots
        : JSON.stringify(timeSlots || []);

    // Persist
    const updated = await scheduleConfigDao.upsertScheduleConfigBySchool(
      schoolId,
      daysStr,
      timeSlotsStr
    );
    // Return parsed schedule config to client
    const safeParse = (s: string) => {
      try {
        return JSON.parse(s);
      } catch {
        return s;
      }
    };
    return NextResponse.json({
      scheduleConfig: {
        days: safeParse(updated.days),
        timeSlots: safeParse(updated.timeSlots),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
