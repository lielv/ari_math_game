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
      system: "You are a helpful AI assistant specialized in teaching math to children. Provide clear, simple explanations and always include Hebrew translations for questions and hints.",
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
