import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScheduleRequest } from "@shared/schema";
import { addDays, differenceInDays, format } from "date-fns";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function generateSchedule(request: ScheduleRequest): Promise<string> {
  const { wakeUpTime, sleepTime, goalTitle, goalDescription, targetDate } = request;

  const targetDateTime = new Date(targetDate);
  const daysUntilTarget = differenceInDays(targetDateTime, new Date()) + 1;

  const prompt = `Create a detailed ${daysUntilTarget}-day learning schedule to achieve the following goal:

Goal: ${goalTitle}
Description: ${goalDescription}
Number of Days: ${daysUntilTarget}

Requirements:
1. Break down the learning path into ${daysUntilTarget} days
2. For each day:
   - Specify what topics to learn
   - Include practice exercises or tasks
   - Add progress checkpoints
3. Follow a logical progression (basics → advanced)
4. Include short breaks between study sessions
5. Working hours: ${wakeUpTime} to ${sleepTime}

Return the response as a JSON object where:
- Keys are the days (e.g. "Day 1", "Day 2")
- Values are objects with "topics" (array of strings) and "schedule" (object with time slots)

Example format:
{
  "Day 1": {
    "topics": ["Python Basics", "Variables", "Data Types"],
    "schedule": {
      "09:00": "Introduction to Python basics",
      "10:30": "Practice with variables",
      "11:00": "Short break",
      "11:15": "Data types exercises"
    }
  }
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Log the AI response for debugging
    console.log('AI Response:', text);

    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);

      // Try to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = jsonMatch[0];
        try {
          const parsed = JSON.parse(extracted);
          return JSON.stringify(parsed);
        } catch {
          throw new Error("Failed to parse extracted JSON");
        }
      }

      return JSON.stringify({
        "message": "Failed to generate schedule",
        "schedule": {}
      });
    }
  } catch (error: any) {
    console.error('Schedule Generation Error:', error);
    throw new Error(`Failed to generate schedule: ${error.message}`);
  }
}

export async function validateConcept(content: string): Promise<string> {
  const prompt = `You are a helpful learning assistant. A student has shared what they learned today. 
Your task is to:
1. Validate if their understanding is correct
2. If correct, provide positive reinforcement and suggest a related advanced topic
3. If incorrect or incomplete, gently correct their understanding and provide an example

Student's learning: "${content}"

Respond conversationally and encouragingly, like a supportive teacher.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    throw new Error(`Failed to validate concept: ${error.message}`);
  }
}