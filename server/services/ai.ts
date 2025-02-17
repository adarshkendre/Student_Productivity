import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScheduleRequest, Goal } from "@shared/schema";
import { isToday, parseISO } from "date-fns";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function generateSchedule(request: ScheduleRequest, goals: Goal[]): Promise<string> {
  const { wakeUpTime, sleepTime } = request;

  // Filter goals due today
  const todaysGoals = goals.filter(goal => 
    !goal.completed && isToday(parseISO(goal.targetDate.toString()))
  );

  if (todaysGoals.length === 0) {
    return JSON.stringify({
      "message": "No goals scheduled for today."
    });
  }

  const prompt = `Create a focused schedule for achieving today's goals:

Goals for today:
${todaysGoals.map(goal => `- ${goal.title}
  Specific: ${goal.specific}
  Measurable: ${goal.measurable}
  Achievable: ${goal.achievable}`).join('\n')}

Time constraints:
- Wake up time: ${wakeUpTime}
- Sleep time: ${sleepTime}

Generate a schedule that helps achieve these specific goals. Include:
1. Focused work sessions for each goal
2. Short breaks between sessions
3. Progress tracking points

Format the response as a JSON object with time slots as keys and goal-related activities as values.
Only include activities related to achieving these goals.`;

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