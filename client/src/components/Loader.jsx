import React from 'react';

const Loader = ({ message = 'Analyzing resume with AI...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 pulse-ring"></div>
      </div>
      <p className="mt-4 text-slate-400 animate-pulse font-medium text-sm text-center">
        {message}
      </p>
    </div>
  );
};

export default Loader;
