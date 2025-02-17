import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScheduleRequest, Goal } from "@shared/schema";
import { format } from "date-fns";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function generateSchedule(request: ScheduleRequest, goals: Goal[]): Promise<string> {
  const { wakeUpTime, sleepTime } = request;

  if (goals.length === 0) {
    return JSON.stringify({
      "message": "No goals found for scheduling."
    });
  }

  const prompt = `Create a focused schedule to help achieve the following goal(s):

${goals.map(goal => `Goal: ${goal.title}
Description: ${goal.description}
Target Date: ${format(new Date(goal.targetDate), 'PPP')}`).join('\n\n')}

Time constraints:
- Wake up time: ${wakeUpTime}
- Sleep time: ${sleepTime}

Generate a schedule that helps achieve these goals. Include:
1. Focused work sessions
2. Short breaks
3. Progress checkpoints

Format the response as a JSON object with time slots as keys and activities as values.
Focus only on activities that directly contribute to achieving the specified goals.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Ensure the response is valid JSON
    try {
      JSON.parse(text);
      return text;
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return jsonMatch[0];
      }
      throw new Error("Failed to generate valid schedule format");
    }
  } catch (error: any) {
    throw new Error(`Failed to generate schedule: ${error.message}`);
  }
}