import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Zap, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import SkillTags from '../components/SkillTags';
import SuggestionList from '../components/SuggestionList';
import Loader from '../components/Loader';
import api from '../services/api';

const JobMatch = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/resume/${id}`);
        setResume(data);
        if (data.jobDescription) {
          setJobDescription(data.jobDescription);
        }
        if (data.matchScore > 0) {
          setMatchResult({
            matchScore: data.matchScore,
            matchedKeywords: data.matchedKeywords,
            missingKeywords: data.missingKeywords
          });
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch resume details.');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setMatching(true);
    setError('');

    try {
      // 1. Calculate match score and get matched/missing keywords
      const matchRes = await api.post(`/resume/${id}/match`, { jobDescription });
      setMatchResult(matchRes.data);

      // 2. Fetch fresh suggestions updated with Job Description alignment instructions
      const suggRes = await api.post(`/resume/${id}/suggestions`);
      setSuggestions(suggRes.data);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred during job description matching.');
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24">
        <Loader message="Loading resume details..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center space-x-3">
        <Link
          to={`/dashboard/${id}`}
          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Role Alignment Scan</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Resume: <span className="text-indigo-400 font-semibold">{resume?.fileName}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Split layout: Form on left, Results on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Job Description input (Lg: 5/12 grid) */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 h-full flex flex-col justify-between">
            <form onSubmit={handleMatch} className="space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
                <h3 className="text-md font-bold text-white tracking-wide">Target Role Specifications</h3>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Paste Text Below</span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description, required skills, or responsibilities list here..."
                required
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none transition duration-150 text-sm resize-none flex-1 min-h-[300px]"
              />
              <button
                type="submit"
                disabled={matching || !jobDescription.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition duration-150 shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
              >
                <Zap className="h-5 w-5" />
                <span>{matching ? 'Checking Alignment...' : 'Scan Alignment'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Results & recommendations (Lg: 7/12 grid) */}
        <div className="lg:col-span-7">
          {matching ? (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 flex items-center justify-center min-h-[400px]">
              <Loader message="Aligning your resume content with the target profile specifications..." />
            </div>
          ) : matchResult ? (
            <div className="space-y-8 animate-fade-in">
              {/* Match Score circular dashboard */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                <ScoreGauge score={matchResult.matchScore} title="Role Fit Score" size={120} />
                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-lg font-bold text-white">Alignment Feedback</h4>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                    {matchResult.matchScore >= 75
                      ? 'Excellent alignment! Your resume details match the key requirements of this role well.'
                      : matchResult.matchScore >= 50
                      ? 'Good progress. Tailoring a few descriptions and including missing keywords would help clarify your relevance.'
                      : 'We recommend revising descriptions slightly to highlight relevant projects that align with this role.'}
                  </p>
                </div>
              </div>

              {/* Matched vs Missing list */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800">
                <SkillTags
                  type="match"
                  matched={matchResult.matchedKeywords}
                  missing={matchResult.missingKeywords}
                />
              </div>

              {/* JD Suggestions checklist */}
              {suggestions.length > 0 && (
                <div className="glass-card p-6 rounded-3xl border border-slate-800">
                  <SuggestionList suggestions={suggestions} />
                </div>
              )}

            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center text-slate-500 min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-md font-bold text-white tracking-wide mb-1">Awaiting Role Details</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Paste the target job description on the left and start the scan to map how well your experience lines up.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JobMatch;
