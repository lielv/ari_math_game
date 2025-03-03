import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-700 mb-4">Math Adventure</h1>
          <p className="text-xl text-gray-600">
            A fun way to improve math skills with interactive exercises and Hebrew voice guidance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/math/addition" className="block">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105 border-2 border-indigo-200">
              <h2 className="text-3xl font-bold text-indigo-600 mb-4">חיבור</h2>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Addition</h2>
              <p className="text-gray-600">Practice adding numbers with fun exercises</p>
              <div className="mt-4 text-4xl font-bold text-indigo-500">1 + 2 = 3</div>
            </div>
          </Link>

          <Link href="/math/subtraction" className="block">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105 border-2 border-indigo-200">
              <h2 className="text-3xl font-bold text-indigo-600 mb-4">חיסור</h2>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Subtraction</h2>
              <p className="text-gray-600">Learn to subtract numbers with interactive problems</p>
              <div className="mt-4 text-4xl font-bold text-indigo-500">5 - 2 = 3</div>
            </div>
          </Link>

          <Link href="/math/multiplication" className="block">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105 border-2 border-indigo-200">
              <h2 className="text-3xl font-bold text-indigo-600 mb-4">כפל</h2>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Multiplication</h2>
              <p className="text-gray-600">Master multiplication with guided exercises</p>
              <div className="mt-4 text-4xl font-bold text-indigo-500">3 × 4 = 12</div>
            </div>
          </Link>

          <Link href="/math/division" className="block">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105 border-2 border-indigo-200">
              <h2 className="text-3xl font-bold text-indigo-600 mb-4">חילוק</h2>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Division</h2>
              <p className="text-gray-600">Learn division with step-by-step guidance</p>
              <div className="mt-4 text-4xl font-bold text-indigo-500">8 ÷ 2 = 4</div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex flex-col items-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Choose a Category</h3>
              <p className="text-gray-600">Select which math skill you want to practice</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Solve Problems</h3>
              <p className="text-gray-600">Listen to the question in Hebrew and solve the problem</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Help When Needed</h3>
              <p className="text-gray-600">Use hints with voice guidance to understand the solution</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
