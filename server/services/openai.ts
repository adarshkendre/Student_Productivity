
import OpenAI from "openai";
import { ScheduleRequest } from "@shared/schema";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const createPrompt = (request: ScheduleRequest): string => {
  const { wakeUpTime, sleepTime, goalTitle, goalDescription, targetDate } = request;
  
  return `Create a detailed day-by-day learning schedule for the goal "${goalTitle}" that needs to be completed by ${targetDate}.

Details:
- Goal: ${goalDescription}
- Wake up time: ${wakeUpTime}
- Sleep time: ${sleepTime}

Please generate a schedule in JSON format with days as keys and a schedule object for each day containing time slots and activities.
Format example:
{
  "Day 1": {
    "schedule": {
      "08:00": "Start with basics",
      "10:00": "Practice exercises",
      "14:00": "Review progress"
    }
  },
  "Day 2": {
    "schedule": {
      "09:00": "Continue learning",
      "11:00": "Project work",
      "15:00": "Review and practice"
    }
  }
}`;
};

export async function generateSchedule(request: ScheduleRequest): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: createPrompt(request) }],
      response_format: { type: "json_object" },
    });

    return response.choices[0].message.content || '{}';
  } catch (error) {
    console.error('Error generating schedule:', error);
    throw new Error('Failed to generate schedule. Please try again later.');
  }
}
