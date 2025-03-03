import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Configure OpenAI with API key from environment variables
    const result = await streamText({
      model: openai("gpt-4o"),
      messages: convertToCoreMessages(messages),
      system: `You are a helpful AI assistant specialized in teaching math to children.
      
      When generating math problems:
      1. Create age-appropriate problems for elementary school children
      2. Provide clear, simple explanations in both English and Hebrew
      3. Include step-by-step working for complex problems
      4. For multiplication and division, show the breakdown of steps
      5. Always format your response as a valid JSON object
      6. Make sure the Hebrew translations are accurate and helpful
      7. Include visual representations of the working steps when helpful (using ASCII art or simple notation)
      8. In Hebrew translations (hebrewQuestion and hebrewHint), all numbers MUST be written as words
         For example: "2 + 2" should be "שתיים ועוד שתיים" not "2 ועוד 2"
      
      Always return your response in this exact JSON format:
      {
        "problem": "The math problem as text (e.g., '5 + 3 = ?')",
        "answer": The numerical answer (e.g., 8),
        "hebrewQuestion": "The question in Hebrew in the format 'כמה זה' and then the math problem.",
        "hebrewHint": "A step-by-step explanation in Hebrew of how to solve this problem.",
        "workingSteps": "Optional step-by-step working in mathematical notation to help visualize the solution process which is aligned with the hebrewHint, so the user can see the steps and understand the solution"  
      }`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("OpenAI API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
