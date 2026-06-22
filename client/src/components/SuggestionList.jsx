import React, { useState } from 'react';
import { CheckSquare, Square, RefreshCw } from 'lucide-react';

const SuggestionList = ({ suggestions = [], onRefresh, isRefreshing }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleChecked = (index) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white tracking-wide">
          Improvement Suggestion Checklist
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Regenerating...' : 'Regenerate'}</span>
          </button>
        )}
      </div>

      {suggestions.length === 0 ? (
        <p className="text-sm text-slate-500 italic py-4">No suggestions generated yet.</p>
      ) : (
        <div className="space-y-2.5">
          {suggestions.map((suggestion, idx) => {
            const isChecked = !!checkedItems[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleChecked(idx)}
                className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition duration-150 ${
                  isChecked
                    ? 'bg-slate-900/40 border-slate-800 opacity-60 line-through text-slate-500'
                    : 'bg-indigo-950/10 border-slate-800/80 text-slate-200 hover:border-indigo-500/25 hover:bg-indigo-950/20'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-indigo-400">
                  {isChecked ? (
                    <CheckSquare className="h-5 w-5 text-indigo-500" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-600 hover:text-indigo-400" />
                  )}
                </div>
                <span className="text-sm font-medium leading-relaxed">{suggestion}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SuggestionList;
