import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScheduleRequest, Goal } from "@shared/schema";
import { format } from "date-fns";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function generateSchedule(request: ScheduleRequest, goals: Goal[]): Promise<string> {
  const { wakeUpTime, sleepTime } = request;

  if (goals.length === 0) {
    return JSON.stringify({
      "message": "No goals found for scheduling.",
      "schedule": {}
    });
  }

  const prompt = `Create a daily schedule as a valid JSON object to achieve this goal:

Goal Details:
${goals.map(goal => `- Title: "${goal.title}"
  Description: "${goal.description}"
  Target Date: "${format(new Date(goal.targetDate), 'PPP')}"`).join('\n')}

Time Constraints:
- Wake up time: ${wakeUpTime}
- Sleep time: ${sleepTime}

Requirements:
1. Return ONLY a valid JSON object with time slots as keys (in HH:MM format) and activities as string values
2. Include focused work sessions, breaks, and checkpoints
3. Focus only on activities that help achieve the goal
4. Use 24-hour time format (e.g. "09:00", "14:30")
5. Include double quotes around all strings

Example format:
{
  "09:00": "Start work on Python basics - Variables and Data Types",
  "10:30": "Take a short break",
  "10:45": "Continue with Python Control Structures"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Log the AI response for debugging
    console.log('AI Response:', text);

    // Ensure the response is valid JSON
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed); // Re-stringify to ensure proper formatting
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);

      // Try to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = jsonMatch[0];
        // Verify the extracted JSON is valid
        try {
          const parsed = JSON.parse(extracted);
          return JSON.stringify(parsed);
        } catch {
          throw new Error("Failed to parse extracted JSON");
        }
      }

      // If all else fails, return a default schedule
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