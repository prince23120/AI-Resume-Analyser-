import React, { useEffect, useState } from 'react';

const ScoreGauge = ({ score = 0, size = 120, title = 'ATS Score' }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    // Animate stroke offset on load
    const progressOffset = circumference - (score / 100) * circumference;
    const timer = setTimeout(() => {
      setOffset(progressOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const getColor = (s) => {
    if (s >= 75) return { stroke: 'stroke-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (s >= 50) return { stroke: 'stroke-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { stroke: 'stroke-rose-500', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  };

  const colors = getColor(score);

  return (
    <div className={`flex flex-col items-center p-6 rounded-2xl glass-card border ${colors.border} w-full max-w-[200px]`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className={`transition-all duration-1000 ease-out ${colors.stroke}`}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-white">{score}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">/ 100</span>
        </div>
      </div>
      <h3 className="mt-4 font-bold text-sm tracking-wide text-slate-300 text-center uppercase">{title}</h3>
    </div>
  );
};

export default ScoreGauge;
