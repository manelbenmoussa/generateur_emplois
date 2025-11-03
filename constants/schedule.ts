// Schedule configuration constants used across the application

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type Day = (typeof DAYS)[number];

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export const TIME_SLOTS: TimeSlot[] = [
  { startTime: "08:15", endTime: "09:45" },
  { startTime: "10:00", endTime: "11:30" },
  { startTime: "11:30", endTime: "13:00" },
  { startTime: "13:30", endTime: "15:00" },
  { startTime: "15:15", endTime: "16:45" },
  { startTime: "16:45", endTime: "18:15" },
  { startTime: "18:15", endTime: "19:45" },

];

export const MAX_TEACHER_HOURS = 16.0;
export const MAX_WEEKLY_SLOTS = DAYS.length * TIME_SLOTS.length;
