import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Configure OpenAI with API key from environment variables
  // The Vercel AI SDK automatically uses OPENAI_API_KEY from environment variables
  const result = await streamText({
    model: openai("gpt-4o"),
    messages: convertToCoreMessages(messages),
    system: "You are a helpful AI assistant specialized in teaching math to children. Provide clear, simple explanations and always include Hebrew translations for questions and hints.",
  });

  return result.toDataStreamResponse();
}
