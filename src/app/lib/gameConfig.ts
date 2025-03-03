interface PerformanceRecord {
  correct: boolean;
  problem: string;
  userAnswer: number;
  correctAnswer: number;
}

interface GameConfig {
  initialPerformanceHistory: {
    addition: PerformanceRecord[];
    subtraction: PerformanceRecord[];
    multiplication: PerformanceRecord[];
    division: PerformanceRecord[];
  };
}

export const gameConfig: GameConfig = {
  initialPerformanceHistory: {
    addition: [
      {
        correct: true,
        problem: '21 + 23 = ?',
        userAnswer: 44,
        correctAnswer: 44
      }
    ],
    subtraction: [
      {
        correct: true,
        problem: '29 - 11 = ?',
        userAnswer: 18,
        correctAnswer: 18
      }
    ],
    multiplication: [
      {
        correct: true,
        problem: '4 × 5 = ?',
        userAnswer: 20,
        correctAnswer: 20
      }
    ],
    division: [
      {
        correct: true,
        problem: '15 ÷ 3 = ?',
        userAnswer: 5,
        correctAnswer: 5
      }
    ]
  }
}; 