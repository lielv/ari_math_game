'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';

interface MathExerciseProps {
  operationType: 'addition' | 'subtraction' | 'multiplication' | 'division';
  operationNameHebrew: string;
  operationSymbol: string;
}

export default function MathExercise({ 
  operationType, 
  operationNameHebrew,
  operationSymbol 
}: MathExerciseProps) {
  const [problem, setProblem] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hintAudioUrl, setHintAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hintAudioRef = useRef<HTMLAudioElement | null>(null);

  const { messages, append, isLoading } = useChat({
    api: '/api/openai/chat',
  });

  // Generate a new math problem
  const generateProblem = async () => {
    setIsGenerating(true);
    setIsCorrect(null);
    setShowHint(false);
    setAnswer('');
    
    try {
      await append({
        role: 'user',
        content: `Generate a ${operationType} math problem suitable for a child. 
        Return ONLY a JSON object with the following format:
        {
          "problem": "The math problem as text (e.g., '5 + 3 = ?')",
          "answer": The numerical answer (e.g., 8),
          "hebrewQuestion": "The question in Hebrew",
          "hebrewHint": "A step-by-step explanation in Hebrew of how to solve this problem"
        }`
      });
    } catch (error) {
      console.error('Error generating problem:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Process the response from the AI
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      try {
        const content = messages[messages.length - 1].content;
        // Extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const problemData = JSON.parse(jsonMatch[0]);
          setProblem(problemData.problem);
          setCorrectAnswer(problemData.answer);
          
          // Generate audio for the question in Hebrew
          generateSpeech(problemData.hebrewQuestion, 'question');
          
          // Generate audio for the hint in Hebrew
          generateSpeech(problemData.hebrewHint, 'hint');
        }
      } catch (error) {
        console.error('Error parsing problem data:', error);
      }
    }
  }, [messages]);

  // Generate speech using a text-to-speech service
  const generateSpeech = async (text: string, type: 'question' | 'hint') => {
    // This is a placeholder for actual TTS implementation
    // In a real app, you would call a TTS API here
    
    console.log(`Generating ${type} speech for: ${text}`);
    
    // Create a direct URL to the TTS API
    if (type === 'question') {
      setAudioUrl(`/api/tts?text=${encodeURIComponent(text)}`);
    } else {
      setHintAudioUrl(`/api/tts?text=${encodeURIComponent(text)}`);
    }
  };

  // Check the user's answer
  const checkAnswer = () => {
    const userAnswer = parseFloat(answer);
    
    if (isNaN(userAnswer)) {
      return;
    }
    
    setIsCorrect(userAnswer === correctAnswer);
  };

  // Play the question audio
  const playQuestionAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
      });
    }
  };

  // Play the hint audio
  const playHintAudio = () => {
    if (hintAudioRef.current && hintAudioUrl) {
      hintAudioRef.current.src = hintAudioUrl;
      hintAudioRef.current.load();
      hintAudioRef.current.play().catch(err => {
        console.error('Error playing hint audio:', err);
      });
    }
  };

  // Generate a problem when the component mounts
  useEffect(() => {
    generateProblem();
  }, [operationType]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-700">
          {operationNameHebrew} <span className="text-gray-500">|</span> {operationType.charAt(0).toUpperCase() + operationType.slice(1)}
        </h1>
        <button 
          onClick={generateProblem}
          disabled={isGenerating || isLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
        >
          {isGenerating ? 'Generating...' : 'New Problem'}
        </button>
      </div>

      {/* Problem display */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Problem:</h2>
          {audioUrl && (
            <button 
              onClick={playQuestionAudio}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Listen
            </button>
          )}
        </div>
        
        {isGenerating ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ) : (
          <div className="text-4xl font-bold text-center py-8 text-gray-800">{problem}</div>
        )}
        
        {/* Hidden audio elements */}
        <audio ref={audioRef} preload="none" />
        <audio ref={hintAudioRef} preload="none" />
      </div>

      {/* Answer input */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Answer:</h2>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="flex-1 p-4 text-2xl border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your answer..."
            disabled={isGenerating || isLoading}
          />
          <button
            onClick={checkAnswer}
            disabled={!answer || isGenerating || isLoading}
            className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 text-xl"
          >
            Submit
          </button>
        </div>
        
        {/* Feedback */}
        {isCorrect !== null && (
          <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isCorrect ? (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Correct! Great job!</span>
              </div>
            ) : (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Not quite right. Try again or use a hint!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hint section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Need Help?</h2>
          {hintAudioUrl && showHint && (
            <button 
              onClick={playHintAudio}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Listen to Hint
            </button>
          )}
        </div>
        
        {!showHint ? (
          <button
            onClick={() => setShowHint(true)}
            className="w-full py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            Show Hint
          </button>
        ) : (
          <div className="p-4 bg-indigo-50 rounded-lg">
            {messages.length > 0 && messages[messages.length - 1].role === 'assistant' ? (
              <div>
                <h3 className="font-semibold mb-2">How to solve this problem:</h3>
                <div className="math-solution p-4 bg-white rounded border border-indigo-200">
                  {(() => {
                    try {
                      const content = messages[messages.length - 1].content;
                      const jsonMatch = content.match(/\{[\s\S]*\}/);
                      if (jsonMatch) {
                        const problemData = JSON.parse(jsonMatch[0]);
                        return (
                          <div>
                            <p className="mb-2 text-gray-800">{problemData.hebrewHint}</p>
                            <p className="mt-4 font-semibold">Answer: {problemData.answer}</p>
                          </div>
                        );
                      }
                      return "Hint not available";
                    } catch (error) {
                      return "Error displaying hint";
                    }
                  })()}
                </div>
              </div>
            ) : (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 