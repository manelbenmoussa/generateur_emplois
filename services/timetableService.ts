import {
  assembleAllEntitiesForSchool,
  isAssembledPayloadDto,
  transformDataForAlgorithm,
  type AssembledPayloadDto,
} from "../dto/timeTableDto";
import { formatScheduleForPdf, type PdfPayload } from "../utils/pdfGenerator";
import { runGreedyScheduling } from "./greedyScheduler";

export async function generateAndFormatTimetable(
  schoolId: number
): Promise<PdfPayload> {
  // 1. Get the clean, flat data from the database.
  const flatData = await assembleAllEntitiesForSchool(schoolId);
  if (!isAssembledPayloadDto(flatData)) {
    throw new Error("Assembled payload validation failed");
  }

  // 2. Transform it into the fast, ID-mapped format for the algorithm.
  const algorithmData = transformDataForAlgorithm(flatData);

  // 3. Run the GREEDY algorithm to get the schedule assignments.
  const scheduleAssignments = runGreedyScheduling(algorithmData);

  // 4. Format the assignments into the final JSON for the PDF.
  const pdfPayload = formatScheduleForPdf(scheduleAssignments, flatData);

  return pdfPayload;
}

export async function buildTimetablePayload(schoolId: number) {
  const data = await assembleAllEntitiesForSchool(schoolId);

  // Validate assembled DTO before returning to algorithm
  if (!isAssembledPayloadDto(data)) {
    throw new Error("Assembled payload validation failed");
  }

  return data as AssembledPayloadDto;
}
