import MathExercise from '../../components/MathExercise';
import Link from 'next/link';

export default function SubtractionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
        
        <MathExercise 
          operationType="subtraction" 
          operationNameHebrew="חיסור" 
          operationSymbol="-"
        />
      </div>
    </main>
  );
} 