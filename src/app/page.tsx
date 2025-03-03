'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { gameConfig } from './lib/gameConfig';
import MathAnimation from './components/MathAnimation';

export default function Home() {
  // State for operation selection
  const [selectedOperations, setSelectedOperations] = useState({
    addition: true,
    subtraction: false,
    multiplication: false,
    division: false
  });
  
  // Add performance tracking state with initial history from config
  const [performanceHistory, setPerformanceHistory] = useState<Array<{ correct: boolean, problem: string, userAnswer: number, correctAnswer: number }>>(() => {
    // Combine all operation histories into a single array
    return [
      ...gameConfig.initialPerformanceHistory.addition,
      ...gameConfig.initialPerformanceHistory.subtraction,
      ...gameConfig.initialPerformanceHistory.multiplication,
      ...gameConfig.initialPerformanceHistory.division
    ];
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
  const [hintText, setHintText] = useState<string>(''); // Store hint text for later use
  
  // Refs for audio elements
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hintAudioRef = useRef<HTMLAudioElement | null>(null);

  // Add ref for input focus
  const inputRef = useRef<HTMLInputElement>(null);

  // OpenAI chat integration
  const { messages, append, isLoading } = useChat({
    api: '/api/openai/chat',
  });

  // Focus input when problem changes
  useEffect(() => {
    if (gameStarted && !isGenerating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStarted, problem, isGenerating]);

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

  // Function to stop all audio playback
  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (hintAudioRef.current) {
      hintAudioRef.current.pause();
      hintAudioRef.current.currentTime = 0;
    }
  };

  // Modify generateProblem to stop audio when generating new problem
  const generateProblem = async () => {
    stopAllAudio(); // Stop any playing audio
    setIsGenerating(true);
    setIsCorrect(null);
    setShowHint(false);
    setAnswer('');
    setWorkingSteps('');
    setInputError(null);
    setHintAudioUrl(null); // Clear hint audio URL
    
    // Get selected operations
    const operations = Object.entries(selectedOperations)
      .filter(([_, selected]) => selected)
      .map(([op, _]) => op);
    
    if (operations.length === 0) {
      setIsGenerating(false);
      return;
    }
    
    try {
      // Get the last 10 problems and answers
      const recentHistory = performanceHistory.slice(-10).map(record => ({
        problem: record.problem,
        userAnswer: record.userAnswer,
        correctAnswer: record.correctAnswer,
        wasCorrect: record.correct
      }));

      await append({
        role: 'user',
        content: `Generate a math problem for a child using one of these operations: ${operations.join(', ')}. 

Here are the last ${recentHistory.length} problems the user attempted:
${JSON.stringify(recentHistory, null, 2)}

Based on their performance history, generate an appropriate problem that matches their current ability level.

Return ONLY a JSON object with the following format:
{
  "problem": "The math problem as text (e.g., '5 + 3 = ?')",
  "answer": The numerical answer (e.g., 8),
  "hebrewQuestion": "The question in Hebrew in the format 'כמה זה' and then the math problem. Use words only (2+2 should be two plus two)",
  "hebrewHint": "A step-by-step explanation in Hebrew of how to solve this problem. Use words only (2+2 should be two plus two)",
  "workingSteps": "Step-by-step working in mathematical notation to help visualize the solution process. MAKE SURE it is aligned with the hebrewHint, so the user can hear the steps in hebrewHint and understand it using the visualization for example if hebrewHint for 46 + 28 = ? is "כדי לפתור את הבעיה, נוסיף את המספרים בעמודות. ראשית נוסיף את הספרות בעמודת האחדות: שש ועוד שמונה שווה ארבע עשרה. נרשום ארבע בעמודת האחדות ונוסיף את האחד לעמודת העשרות. עכשיו נוסיף את הספרות בעמודת העשרות: ארבע ועוד שתיים ועוד אחד שווה שבע. התוצאה היא שבעים וארבע" the notation should be  (8+6) + (40+20)  = 74",
}`
      });
    } catch (error) {
      console.error('Error generating problem:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Play the hint audio with proper loading handling
  const playHintAudio = async () => {
    stopAllAudio(); // Stop any playing audio before starting new one
    try {
      if (!hintAudioUrl && hintText) {
        // Generate hint audio only when needed
        await generateSpeech(hintText, 'hint');
      }
      
      // Wait a short moment for the audio URL to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (hintAudioRef.current && hintAudioUrl) {
        hintAudioRef.current.src = hintAudioUrl;
        await hintAudioRef.current.load();
        await hintAudioRef.current.play();
      }
    } catch (err) {
      console.error('Error playing hint audio:', err);
    }
  };

  // Generate speech using a text-to-speech service
  const generateSpeech = async (text: string, type: 'question' | 'hint') => {
    console.log(`Generating ${type} speech for: ${text}`);
    
    try {
      // Create a direct URL to the TTS API
      const url = `/api/tts?text=${encodeURIComponent(text)}`;
      
      // Return a promise that resolves when the URL is set
      return new Promise<void>((resolve) => {
        if (type === 'question') {
          setAudioUrl(url);
        } else {
          setHintAudioUrl(url);
        }
        resolve();
      });
    } catch (error) {
      console.error(`Error generating ${type} speech:`, error);
    }
  };

  // Play the question audio with proper loading handling
  const playQuestionAudio = async () => {
    stopAllAudio(); // Stop any playing audio before starting new one
    if (audioRef.current && audioUrl) {
      try {
        audioRef.current.src = audioUrl;
        await audioRef.current.load();
        await audioRef.current.play();
      } catch (err) {
        console.error('Error playing audio:', err);
      }
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
          
          // Store hint text and generate both audios
          setHintText(problemData.hebrewHint);
          
          // Generate both audios immediately
          const generateAudios = async () => {
            // Generate question audio and play it immediately
            await generateSpeech(problemData.hebrewQuestion, 'question');
            setTimeout(() => {
              playQuestionAudio();
            }, 500);
            
            // Generate hint audio but don't play it yet
            await generateSpeech(problemData.hebrewHint, 'hint');
          };
          
          generateAudios();
        }
      } catch (error) {
        console.error('Error parsing problem data:', error);
      }
    }
  }, [messages]);

  // Handle showing hint - now just plays the already generated audio
  const handleShowHint = () => {
    setShowHint(true);
    if (hintAudioRef.current && hintAudioUrl) {
      stopAllAudio();
      hintAudioRef.current.src = hintAudioUrl;
      hintAudioRef.current.load();
      hintAudioRef.current.play().catch(err => {
        console.error('Error playing hint audio:', err);
      });
    }
  };

  // Modify checkAnswer to update performance history without difficulty calculation
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
    
    const isCorrect = userAnswer === correctAnswer;
    setIsCorrect(isCorrect);
    
    // Update performance history
    const newHistory = [...performanceHistory, {
      correct: isCorrect,
      problem,
      userAnswer,
      correctAnswer: correctAnswer!
    }];
    setPerformanceHistory(newHistory);
    
    // If correct, generate a new problem after a short delay
    if (isCorrect) {
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 to-violet-100 flex">
      {/* Main content area */}
      <div className="flex-1 py-8 px-6">
        <h1 className="text-4xl font-bold text-center text-fuchsia-600 mb-8">עוֹלָם הַחֶשְׁבּוֹן שֶׁל אָרִי</h1>
        
        {!gameStarted ? (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-3xl mx-auto border-4 border-fuchsia-200">
            <h2 className="text-2xl font-bold text-fuchsia-500 mb-6 text-right">!בְּרוּכִים הַבָּאִים לְהַרְפַּתְקַאת הַחֶשְׁבּוֹן שֶׁל אָרִי</h2>
            <p className="text-lg mb-6 text-violet-700 text-right">בַּחֲרוּ אֶת פְּעֻלּוֹת הַחֶשְׁבּוֹן שֶׁתִּרְצוּ לְתַרְגֵּל מֵהַתַּפְרִיט בַּצַּד, וְאָז לַחֲצוּ עַל "בּוֹאוּ נְשַׂחֵק" כְּדֵי לְהַתְחִיל</p>
            <div className="flex justify-center">
              <MathAnimation />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Game interface */}
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={() => setGameStarted(false)}
                className="text-fuchsia-600 hover:text-fuchsia-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                חֲזָרָה לַמָּסָךְ הָרָאשִׁי
              </button>
            </div>
            
            {/* Problem display */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-4 border-sky-200">
              <div className="flex justify-between items-center mb-4">
                {audioUrl && (
                  <button
                    onClick={playQuestionAudio}
                    className="flex items-center text-sky-600 hover:text-sky-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    הַאֲזָנָה
                  </button>
                )}
                <h2 className="text-xl font-semibold text-violet-700">:תַּרְגִּיל</h2>
              </div>
              
              {isGenerating ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-12 bg-sky-100 rounded w-3/4"></div>
                  </div>
                </div>
              ) : (
                <div className="text-4xl font-bold text-center py-8 text-violet-800 math-problem">{problem}</div>
              )}
              
              {/* Hidden audio elements */}
              <audio ref={audioRef} preload="none" />
              <audio ref={hintAudioRef} preload="none" />
            </div>
            
            {/* Answer input */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-4 border-violet-200">
              <h2 className="text-xl font-semibold text-violet-700 mb-4 text-right">:הַתְּשׁוּבָה שֶׁלְּךָ</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={checkAnswer}
                  disabled={!answer || isGenerating || isLoading}
                  className="bg-emerald-500 text-white px-6 py-4 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-gray-400 text-xl"
                >
                  בְּדִיקָה
                </button>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full p-4 text-2xl text-black text-right border-2 border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                    placeholder="...הַכְנִיסוּ אֶת הַתְּשׁוּבָה שֶׁלָּכֶם"
                    disabled={isGenerating || isLoading}
                  />
                </div>
              </div>
              
              {/* Input validation error */}
              {inputError && (
                <div className="mt-2 text-rose-600">
                  {inputError === 'Please enter an answer' ? 'אָנָּא הַכְנִיסוּ תְּשׁוּבָה' : 
                   inputError === 'Not a valid number' ? 'אָנָּא הַכְנִיסוּ מִסְפָּר תָּקִין' : 
                   inputError}
                </div>
              )}
              
              {/* Feedback */}
              {isCorrect !== null && !inputError && (
                <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {isCorrect ? (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>נָכוֹן! כָּל הַכָּבוֹד</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end">
                      <span>לֹא בְּדִיּוּק. נַסּוּ שׁוּב אוֹ הִשְׁתַּמְּשׁוּ בָּרֶמֶז לְמַטָּה</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Hint section */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-fuchsia-200">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handleShowHint}
                  className="flex items-center text-fuchsia-600 hover:text-fuchsia-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  הַאֲזָנָה לָרֶמֶז
                </button>
                <h2 className="text-xl font-semibold text-violet-700 text-right">?צְרִיכִים עֶזְרָה</h2>
              </div>
              
              {!showHint ? (
                <button
                  onClick={handleShowHint}
                  className="w-full py-3 bg-fuchsia-100 text-fuchsia-700 rounded-lg hover:bg-fuchsia-200 transition-colors"
                >
                  הַצֵּג רֶמֶז
                </button>
              ) : (
                <div className="p-4 bg-fuchsia-50 rounded-lg text-black">
                  {workingSteps}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar with operation checkboxes */}
      <div className="w-72 bg-gradient-to-b from-amber-100 to-amber-200 shadow-2xl rounded-xl p-6 flex flex-col sidebar-right border-4 border-amber-300">
        {/* Header with a line break beneath it */}
        <h2 className="text-xl font-bold text-violet-700 text-center mb-2">פְּעֻלּוֹת חֶשְׁבּוֹן</h2>
        <div className="border-b-2 border-violet-300 mb-6"></div>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-end">
            <label htmlFor="addition" className="text-lg ml-4 text-violet-900 flex items-center">
              <span className="font-semibold pr-4">חִבּוּר</span>
            </label>
            <input
              type="checkbox"
              id="addition"
              checked={selectedOperations.addition}
              onChange={() => handleOperationChange('addition')}
              className="w-5 h-5 text-fuchsia-600 focus:ring-fuchsia-500"
            />
          </div>
          
          <div className="flex items-center justify-end">
            <label htmlFor="subtraction" className="text-lg ml-4 text-violet-900 flex items-center">
              <span className="font-semibold pr-4">חִסּוּר</span>
            </label>
            <input
              type="checkbox"
              id="subtraction"
              checked={selectedOperations.subtraction}
              onChange={() => handleOperationChange('subtraction')}
              className="w-5 h-5 text-fuchsia-600 focus:ring-fuchsia-500"
            />
          </div>
          
          <div className="flex items-center justify-end">
            <label htmlFor="multiplication" className="text-lg ml-4 text-violet-900 flex items-center">
              <span className="font-semibold pr-4">כֶּפֶל</span>
            </label>
            <input
              type="checkbox"
              id="multiplication"
              checked={selectedOperations.multiplication}
              onChange={() => handleOperationChange('multiplication')}
              className="w-5 h-5 text-fuchsia-600 focus:ring-fuchsia-500"
            />
          </div>
          
          <div className="flex items-center justify-end">
            <label htmlFor="division" className="text-lg ml-4 text-violet-900 flex items-center">
              <span className="font-semibold pr-4">חִלּוּק</span>
            </label>
            <input
              type="checkbox"
              id="division"
              checked={selectedOperations.division}
              onChange={() => handleOperationChange('division')}
              className="w-5 h-5 text-fuchsia-600 focus:ring-fuchsia-500"
            />
          </div>
        </div>

        <div className="flex-1"></div>
        
        <div className="mt-auto">
          {!gameStarted ? (
            <button
              onClick={startGame}
              className="w-3/4 mx-auto py-4 bg-fuchsia-500 text-white text-lg font-semibold rounded-lg hover:bg-fuchsia-600 transition-colors shadow-lg"
            >
              בּוֹאוּ נְשַׂחֵק
            </button>
          ) : (
            <button
              onClick={generateProblem}
              disabled={isGenerating || isLoading}
              className="w-3/4 mx-auto py-4 bg-fuchsia-500 text-white text-lg font-semibold rounded-lg hover:bg-fuchsia-600 transition-colors disabled:bg-gray-400 shadow-lg"
            >
              תַּרְגִּיל חָדָשׁ
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
