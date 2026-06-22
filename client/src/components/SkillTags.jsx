import React from 'react';
import { Check, X } from 'lucide-react';

const SkillTags = ({ skills = [], matched = [], missing = [], type = 'default' }) => {
  if (type === 'match') {
    return (
      <div className="space-y-6">
        {/* Matched Keywords */}
        <div>
          <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center space-x-1.5 uppercase tracking-wide">
            <Check className="h-4 w-4" />
            <span>Matched Keywords ({matched.length})</span>
          </h4>
          {matched.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No keywords matched yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {matched.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition hover:bg-emerald-500/15"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Missing Keywords */}
        <div>
          <h4 className="text-sm font-semibold text-rose-400 mb-3 flex items-center space-x-1.5 uppercase tracking-wide">
            <X className="h-4 w-4" />
            <span>Missing Keywords ({missing.length})</span>
          </h4>
          {missing.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No missing keywords! Excellent alignment.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missing.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition hover:bg-rose-500/15"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default display for general extracted skills
  return (
    <div>
      {skills.length === 0 ? (
        <p className="text-sm text-slate-500 italic">No skills extracted.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, idx) => (
            <span
              key={idx}
              className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-xl transition hover:bg-indigo-500/15"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillTags;
