
import OpenAI from "openai";
import { ScheduleRequest } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateSchedule(request: ScheduleRequest): Promise<string> {
  const { wakeUpTime, sleepTime, goalTitle, goalDescription, targetDate } = request;
  
  const prompt = `Create a detailed day-by-day learning schedule for the goal "${goalTitle}" that needs to be completed by ${targetDate}.

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

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return response.choices[0].message.content;
}
