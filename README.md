# Ari's Math Adventure

An interactive math learning game with Hebrew voice support to help children improve their math skills.

## Features

- **Four Math Operations**: Addition, Subtraction, Multiplication, and Division
- **Interactive Interface**: Engaging UI with immediate feedback
- **Hebrew Voice Support**: Questions and hints are provided in Hebrew
- **LLM-Powered**: Uses OpenAI's GPT-4o to generate age-appropriate math problems
- **Hint System**: Step-by-step explanations to help children understand how to solve problems

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lielv/ari_math_game.git
   cd ari_math_game
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How It Works

1. **Choose a Math Operation**: Select from Addition, Subtraction, Multiplication, or Division
2. **Solve Problems**: Listen to the question in Hebrew and solve the math problem
3. **Get Feedback**: Receive immediate feedback on your answer
4. **Use Hints**: If needed, get step-by-step guidance with Hebrew voice support

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: For type safety
- **Tailwind CSS**: For responsive and beautiful UI
- **Vercel AI SDK**: For OpenAI integration
- **Text-to-Speech**: For Hebrew voice guidance

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Created for Ari to make learning math fun and interactive
- Built with love using Next.js and OpenAI