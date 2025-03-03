import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');

  if (!text) {
    return NextResponse.json(
      { error: 'Text parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Use OpenAI's TTS API to generate speech
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy", // You can change this to "echo", "fable", "onyx", "nova", or "shimmer"
      input: text,
    });

    // Convert the response to an ArrayBuffer
    const buffer = await response.arrayBuffer();

    // Return the audio as a response
    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    
    // If there's an error with OpenAI's TTS, fall back to the mock audio
    return NextResponse.redirect(new URL(`/api/mock-audio?text=${encodeURIComponent(text)}`, request.url));
  }
} 