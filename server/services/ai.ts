
import { ScheduleRequest } from "@shared/schema";
import { generateSchedule as openAIGenerateSchedule } from "./openai";

export async function generateSchedule(request: ScheduleRequest): Promise<string> {
  return openAIGenerateSchedule(request);
}

export async function validateConcept(content: string): Promise<string> {
  // For now, return a simple validation message
  // You can implement actual OpenAI validation logic here
  return `Thanks for sharing! Here's what I understand about the concept: ${content}`;
}
