import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Cpu, CheckCircle2, ChevronRight, Briefcase, GraduationCap } from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import SkillTags from '../components/SkillTags';
import SuggestionList from '../components/SuggestionList';
import Loader from '../components/Loader';
import api from '../services/api';

const Dashboard = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Progress states for sequential backend calls
  const [statusText, setStatusText] = useState('Fetching resume details...');
  const [extracting, setExtracting] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

const fetchAnalysisFlow = async () => {
  try {
    setLoading(true);
    setError('');

    // Fetch resume
    setStatusText('Fetching uploaded resume document...');
    const resumeRes = await api.get(`/resume/${id}`);

    const currentResume = resumeRes.data;

    setResume(currentResume);
    setLoading(false);

    // STEP 1: Extract Skills
    if (!currentResume.skills || currentResume.skills.length === 0) {
      setExtracting(true);

      try {
        const res = await api.post(`/resume/${id}/extract`);

        setResume(prev => ({
          ...prev,
          ...res.data
        }));
      } catch (err) {
        console.error('Skill extraction error:', err);
      } finally {
        setExtracting(false);
      }
    }

    // STEP 2: ATS Score
    if (!currentResume.atsScore || currentResume.atsScore === 0) {
      setScoring(true);

      try {
        const res = await api.post(`/resume/${id}/ats-score`);

        setResume(prev => ({
          ...prev,
          atsScore: res.data.score,
          atsBreakdown: res.data.breakdown
        }));
      } catch (err) {
        console.error('ATS scoring error:', err);
      } finally {
        setScoring(false);
      }
    }

    // STEP 3: Suggestions
    if (!currentResume.suggestions || currentResume.suggestions.length === 0) {
      setSuggesting(true);

      try {
        const res = await api.post(`/resume/${id}/suggestions`);

        setResume(prev => ({
          ...prev,
          suggestions: res.data
        }));
      } catch (err) {
        console.error('Suggestions generation error:', err);
      } finally {
        setSuggesting(false);
      }
    }

  } catch (err) {
    console.error(err);

    setError(
      err.response?.data?.message ||
      'Error occurred during resume analysis.'
    );

    setLoading(false);
  }
};
  useEffect(() => {
    fetchAnalysisFlow();
  }, [id]);

  const handleRefreshSuggestions = async () => {
    try {
      setSuggesting(true);
      // Temporarily clear suggestions to force refresh
      const { data } = await api.post(`/resume/${id}/suggestions`, {}, {
        headers: { 'Cache-Control': 'no-cache' } // Backend logic handles fresh suggestions
      });
      setResume(prev => ({ ...prev, suggestions: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  };

  if (loading && !resume) {
    return (
      <div className="max-w-4xl mx-auto py-24">
        <Loader message={statusText} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 px-6">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl text-center">
          <p className="font-semibold text-lg mb-4">Analysis Failed</p>
          <p className="text-sm opacity-80 mb-6">{error}</p>
          <button
            onClick={fetchAnalysisFlow}
            className="bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm px-6 py-2 rounded-xl transition duration-150 shadow-md cursor-pointer"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 glass-card">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">{resume.fileName}</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Link
          to={`/match/${resume._id}`}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition duration-150 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/10 shrink-0 cursor-pointer"
        >
          <span>Check Role Alignment</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Main Grid: Score, Breakdown, Suggestions, Extracted profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Scores and breakdown (Lg: 5/12 grid) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Score Gauges */}
          <div className="flex items-center justify-center lg:justify-start space-x-6">
            <ScoreGauge score={resume.atsScore} title="Resume Score" size={140} />
            {resume.matchScore > 0 && (
              <ScoreGauge score={resume.matchScore} title="Role Fit Score" size={140} />
            )}
          </div>

          {/* ATS Rubric Breakdown */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
            <h3 className="text-lg font-bold text-white tracking-wide border-b border-slate-800 pb-3 flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-400" />
              <span>Resume Health Check</span>
            </h3>

            {scoring ? (
              <Loader message="Scoring..." />
            ) : (
              <div className="space-y-4">
                {/* Rubric Progress Lines */}
                {[
                  { name: 'Layout & Presentation', val: resume.atsBreakdown?.formatting },
                  { name: 'Section Organization', val: resume.atsBreakdown?.sectionHeaders },
                  { name: 'Vocabulary & Keywords', val: resume.atsBreakdown?.keywordDensity },
                  { name: 'Quantifying Your Impact', val: resume.atsBreakdown?.quantifiedAchievements },
                  { name: 'Contact Information', val: resume.atsBreakdown?.contactInfo }
                ].map((item, idx) => {
                  const percentage = ((item.val || 0) / 20) * 100;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-300">
                        <span>{item.name}</span>
                        <span>{item.val || 0} / 20</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}

                {/* Details Narrative */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed mt-4">
                  <strong className="text-slate-300 block mb-1">Feedback Summary:</strong>
                  {resume.atsBreakdown?.details || 'No specific breakdown narrative is available.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Skills Profile & suggestions list (Lg: 7/12 grid) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Extracted Profile details */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white tracking-wide border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-indigo-400" />
              <span>Profile Summary</span>
            </h3>

            {extracting ? (
              <Loader message="Extracting Profile..." />
            ) : (
              <div className="space-y-6">
                
                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3.5 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                    <Briefcase className="h-5 w-5 text-indigo-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Experience</span>
                      <span className="text-sm font-bold text-white">
                        {resume.experienceYears} {resume.experienceYears === 1 ? 'Year' : 'Years'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3.5 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                    <GraduationCap className="h-5 w-5 text-indigo-400 shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Education</span>
                      <span className="text-sm font-bold text-white truncate block">
                        {resume.education && resume.education.length > 0 ? resume.education[0] : 'Not found'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Job Titles */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Identified Target Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {resume.jobTitles && resume.jobTitles.map((title, idx) => (
                      <span key={idx} className="bg-slate-900 text-slate-300 border border-slate-800 px-3 py-1 rounded-lg text-xs font-medium">
                        {title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills Tags */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Extracted Keywords & Skills</h4>
                  <SkillTags skills={resume.skills} />
                </div>

              </div>
            )}
          </div>

          {/* Actionable suggestions list */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800">
            {suggesting ? (
              <Loader message="Generating suggestions..." />
            ) : (
              <SuggestionList
                suggestions={resume.suggestions}
                onRefresh={handleRefreshSuggestions}
                isRefreshing={suggesting}
              />
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
