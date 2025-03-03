'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';

export default function Home() {
  // State for operation selection
  const [selectedOperations, setSelectedOperations] = useState({
    addition: true,
    subtraction: false,
    multiplication: false,
    division: false
  });
  
  // State for game flow
  const [gameStarted, setGameStarted] = useState(false);
  const [problem, setProblem] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hintAudioUrl, setHintAudioUrl] = useState<string | null>(null);
  const [workingSteps, setWorkingSteps] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);
  
  // Refs for audio elements
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hintAudioRef = useRef<HTMLAudioElement | null>(null);

  // OpenAI chat integration
  const { messages, append, isLoading } = useChat({
    api: '/api/openai/chat',
  });

  // Handle operation checkbox changes
  const handleOperationChange = (operation: string) => {
    setSelectedOperations(prev => ({
      ...prev,
      [operation]: !prev[operation as keyof typeof prev]
    }));
  };

  // Start the game with selected operations
  const startGame = () => {
    // Ensure at least one operation is selected
    if (!Object.values(selectedOperations).some(value => value)) {
      alert('Please select at least one operation');
      return;
    }
    
    setGameStarted(true);
    generateProblem();
  };

  // Generate a new math problem based on selected operations
  const generateProblem = async () => {
    setIsGenerating(true);
    setIsCorrect(null);
    setShowHint(false);
    setAnswer('');
    setWorkingSteps('');
    setInputError(null);
    
    // Get selected operations
    const operations = Object.entries(selectedOperations)
      .filter(([_, selected]) => selected)
      .map(([op, _]) => op);
    
    if (operations.length === 0) {
      setIsGenerating(false);
      return;
    }
    
    try {
      await append({
        role: 'user',
        content: `Generate a math problem for a child using one of these operations: ${operations.join(', ')}. 
        Return ONLY a JSON object with the following format:
        {
          "problem": "The math problem as text (e.g., '5 + 3 = ?')",
          "answer": The numerical answer (e.g., 8),
          "hebrewQuestion": "The question in Hebrew",
          "hebrewHint": "A step-by-step explanation in Hebrew of how to solve this problem",
          "workingSteps": "Optional step-by-step working in mathematical notation to help visualize the solution process"
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
          
          // Set working steps if available
          if (problemData.workingSteps) {
            setWorkingSteps(problemData.workingSteps);
          }
          
          // Generate audio for the question in Hebrew
          generateSpeech(problemData.hebrewQuestion, 'question');
          
          // Generate audio for the hint in Hebrew
          generateSpeech(problemData.hebrewHint, 'hint');
          
          // Automatically play the question audio
          setTimeout(() => {
            playQuestionAudio();
          }, 500);
        }
      } catch (error) {
        console.error('Error parsing problem data:', error);
      }
    }
  }, [messages]);

  // Generate speech using a text-to-speech service
  const generateSpeech = async (text: string, type: 'question' | 'hint') => {
    console.log(`Generating ${type} speech for: ${text}`);
    
    try {
      // Create a direct URL to the TTS API
      const url = `/api/tts?text=${encodeURIComponent(text)}`;
      
      if (type === 'question') {
        setAudioUrl(url);
      } else {
        setHintAudioUrl(url);
      }
    } catch (error) {
      console.error(`Error generating ${type} speech:`, error);
    }
  };

  // Check the user's answer
  const checkAnswer = () => {
    // Clear previous error
    setInputError(null);
    
    // Validate input is a number
    const userAnswerTrimmed = answer.trim();
    const userAnswer = parseFloat(userAnswerTrimmed);
    
    if (userAnswerTrimmed === '') {
      setInputError('Please enter an answer');
      return;
    }
    
    if (isNaN(userAnswer)) {
      setInputError('Not a valid number');
      return;
    }
    
    setIsCorrect(userAnswer === correctAnswer);
    
    // Don't show hint automatically anymore
    if (userAnswer === correctAnswer) {
      // If correct, generate a new problem after a short delay
      setTimeout(() => {
        generateProblem();
      }, 1500);
    }
  };

  // Handle Enter key press in the answer input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex">
      {/* Sidebar with operation checkboxes */}
      <div className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <h2 className="text-xl font-bold text-indigo-600 mb-6">Math Operations</h2>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="addition"
              checked={selectedOperations.addition}
              onChange={() => handleOperationChange('addition')}
              className="w-5 h-5 text-indigo-600"
            />
            <label htmlFor="addition" className="text-lg ml-3 flex-1">
              <span className="font-semibold">חיבור</span> | Addition (+)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="subtraction"
              checked={selectedOperations.subtraction}
              onChange={() => handleOperationChange('subtraction')}
              className="w-5 h-5 text-indigo-600"
            />
            <label htmlFor="subtraction" className="text-lg ml-3 flex-1">
              <span className="font-semibold">חיסור</span> | Subtraction (-)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="multiplication"
              checked={selectedOperations.multiplication}
              onChange={() => handleOperationChange('multiplication')}
              className="w-5 h-5 text-indigo-600"
            />
            <label htmlFor="multiplication" className="text-lg ml-3 flex-1">
              <span className="font-semibold">כפל</span> | Multiplication (×)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="division"
              checked={selectedOperations.division}
              onChange={() => handleOperationChange('division')}
              className="w-5 h-5 text-indigo-600"
            />
            <label htmlFor="division" className="text-lg ml-3 flex-1">
              <span className="font-semibold">חילוק</span> | Division (÷)
            </label>
          </div>
        </div>
        
        {!gameStarted ? (
          <button
            onClick={startGame}
            className="w-full py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors mt-auto"
          >
            Let's Play!
          </button>
        ) : (
          <button
            onClick={generateProblem}
            disabled={isGenerating || isLoading}
            className="w-full py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors mt-auto disabled:bg-gray-400"
          >
            New Problem
          </button>
        )}
      </div>
      
      {/* Main content area */}
      <div className="flex-1 py-8 px-6">
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8">Ari's Math Adventure</h1>
        
        {!gameStarted ? (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-indigo-600 mb-6">Welcome to Math Adventure!</h2>
            <p className="text-lg mb-6">Select the math operations you want to practice from the sidebar, then click "Let's Play!" to start.</p>
            <div className="flex justify-center">
              <img src="/math-illustration.svg" alt="Math Adventure" className="w-64 h-64 opacity-70" />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Game interface */}
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={() => setGameStarted(false)}
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Welcome
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
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full p-4 text-2xl border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your answer..."
                    disabled={isGenerating || isLoading}
                  />
                </div>
                <button
                  onClick={checkAnswer}
                  disabled={!answer || isGenerating || isLoading}
                  className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 text-xl"
                >
                  Submit
                </button>
              </div>
              
              {/* Input validation error */}
              {inputError && (
                <div className="mt-2 text-red-600">
                  {inputError}
                </div>
              )}
              
              {/* Feedback */}
              {isCorrect !== null && !inputError && (
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
                      <span>Not quite right. Try again or use the hint below.</span>
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
                  onClick={() => {
                    setShowHint(true);
                    playHintAudio();
                  }}
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
                                  
                                  {/* Working steps visualization */}
                                  {workingSteps && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                      <h4 className="font-semibold mb-2">Working Steps:</h4>
                                      <pre className="whitespace-pre-wrap font-mono text-sm">{workingSteps}</pre>
                                    </div>
                                  )}
                                  
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
        )}
      </div>
    </main>
  );
}
