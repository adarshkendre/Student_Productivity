import { ScheduleRequest } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const createPrompt = (request: ScheduleRequest): string => {
  const { wakeUpTime, sleepTime, goalTitle, goalDescription, targetDate } = request;

  return `Create a detailed day-by-day learning schedule for the goal "${goalTitle}" that needs to be completed by ${targetDate}.

Details:
- Goal: ${goalDescription}
- Wake up time: ${wakeUpTime}
- Sleep time: ${sleepTime}

Please generate a schedule in JSON format with days as keys and both topics to cover and a schedule object for each day. Format example:
{
  "Day 1": {
    "topics": [
      "Introduction to basic concepts",
      "Setting up the environment"
    ],
    "schedule": {
      "08:00": "Review basic concepts",
      "10:00": "Practice exercises",
      "14:00": "Project work"
    }
  }
}`;
};

export async function generateSchedule(request: ScheduleRequest): Promise<string> {
  try {
    const prompt = createPrompt(request);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed);
    } catch (parseError) {
      // If the response isn't valid JSON, try to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          return JSON.stringify(extracted);
        } catch {
          // If extraction fails, return a default format
          return JSON.stringify({
            "Day 1": {
              "topics": ["Getting Started"],
              "schedule": {
                [request.wakeUpTime]: "Begin learning session"
              }
            }
          });
        }
      }

      return JSON.stringify({
        "message": "Failed to generate schedule. Please try again.",
        "schedule": {}
      });
    }
  } catch (error: any) {
    console.error('Error generating schedule:', error);
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
    console.error('Error validating concept:', error);
    throw new Error(`Failed to validate concept: ${error.message}`);
  }
}