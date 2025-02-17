
import { ScheduleRequest } from "@shared/schema";
import { generateSchedule as openAIGenerateSchedule } from "./openai";

export async function generateSchedule(request: ScheduleRequest): Promise<string> {
  return openAIGenerateSchedule(request);
}
