import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScheduleRequest } from "@shared/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Ensure the response is valid JSON
    try {
      JSON.parse(text);
      return text;
    } catch {
      // If the response isn't valid JSON, try to extract JSON from the text
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
