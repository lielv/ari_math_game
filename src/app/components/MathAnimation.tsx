import React from 'react';

const MathAnimation = () => {
  // Define math symbols to animate
  const symbols = [
    { symbol: '+', color: 'text-fuchsia-500', size: 'text-4xl', delay: '0s' },
    { symbol: '-', color: 'text-sky-500', size: 'text-4xl', delay: '0.5s' },
    { symbol: '×', color: 'text-violet-500', size: 'text-4xl', delay: '1s' },
    { symbol: '÷', color: 'text-emerald-500', size: 'text-4xl', delay: '1.5s' },
    { symbol: '2', color: 'text-amber-500', size: 'text-3xl', delay: '0.2s' },
    { symbol: '7', color: 'text-rose-500', size: 'text-3xl', delay: '0.7s' },
    { symbol: '4', color: 'text-blue-500', size: 'text-3xl', delay: '1.2s' },
    { symbol: '9', color: 'text-purple-500', size: 'text-3xl', delay: '1.7s' },
    { symbol: '5', color: 'text-teal-500', size: 'text-3xl', delay: '0.4s' },
    { symbol: '3', color: 'text-indigo-500', size: 'text-3xl', delay: '0.9s' },
    // Additional symbols
    { symbol: '+', color: 'text-pink-500', size: 'text-4xl', delay: '0.3s' },
    { symbol: '-', color: 'text-cyan-500', size: 'text-4xl', delay: '0.8s' },
    { symbol: '×', color: 'text-purple-500', size: 'text-4xl', delay: '1.3s' },
    { symbol: '÷', color: 'text-green-500', size: 'text-4xl', delay: '1.8s' },
    { symbol: '6', color: 'text-yellow-500', size: 'text-3xl', delay: '0.1s' },
    { symbol: '8', color: 'text-red-500', size: 'text-3xl', delay: '0.6s' },
    { symbol: '1', color: 'text-indigo-500', size: 'text-3xl', delay: '1.1s' },
    { symbol: '0', color: 'text-violet-500', size: 'text-3xl', delay: '1.6s' },
    { symbol: '=', color: 'text-fuchsia-500', size: 'text-3xl', delay: '0.4s' },
    { symbol: '?', color: 'text-sky-500', size: 'text-3xl', delay: '0.9s' },
  ];

  return (
    <div className="relative w-full h-64 bg-white/50 rounded-xl overflow-hidden">
      {symbols.map((item, index) => (
        <div
          key={index}
          className={`absolute animate-float ${item.color} ${item.size} font-bold`}
          style={{
            left: `${Math.random() * 80}%`,
            top: `${Math.random() * 80}%`,
            animationDelay: item.delay,
            animationDuration: `${4 + Math.random() * 4}s`,
          }}
        >
          {item.symbol}
        </div>
      ))}
    </div>
  );
};

export default MathAnimation; 