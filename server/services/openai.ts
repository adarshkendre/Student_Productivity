import OpenAI from "openai";
import { ScheduleRequest } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateSchedule(request: ScheduleRequest): Promise<string> {
  const { wakeUpTime, sleepTime, preferences } = request;
  
  const prompt = `Create a detailed daily schedule following these requirements:
- Wake up time: ${wakeUpTime}
- Sleep time: ${sleepTime}
- User preferences: ${preferences.join(", ")}

Please generate a schedule in a structured format with specific time slots and activities. 
Consider:
1. Study/work periods
2. Break times
3. Meal times
4. Exercise/physical activity
5. Personal development
6. Relaxation

Format the response as a JSON object with time slots as keys and activities as values.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return response.choices[0].message.content;
}
