import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Eye, FileText, PlusCircle, Calendar, Sparkles } from 'lucide-react';
import Loader from '../components/Loader';
import api from '../services/api';

const History = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/resume/history');
      setResumes(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch resume history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume history record?')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/resume/${id}`);
      setResumes(resumes.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete resume record.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24">
        <Loader message="Fetching your upload history..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Analysis History</h1>
          <p className="text-slate-400 text-xs mt-1">Review, compare, and manage your past resume analyzes</p>
        </div>
        <Link
          to="/"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition duration-150 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Upload</span>
        </Link>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 pulse-ring">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide mb-1">No Resumes Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            You haven't uploaded any resumes for analysis yet. Let's upload your first resume to supercharge your career.
          </p>
          <Link
            to="/"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition duration-150 shadow-md shadow-indigo-600/15"
          >
            Upload Resume PDF
          </Link>
        </div>
      ) : (
        /* History Grid List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => {
            return (
              <div
                key={resume._id}
                onClick={() => navigate(`/dashboard/${resume._id}`)}
                className="glass-card p-6 rounded-3xl border border-slate-800 glass-card-hover flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* File Metadata */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition">
                      <FileText className="h-5 w-5" />
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition duration-200">
                      <button
                        onClick={(e) => handleDelete(resume._id, e)}
                        disabled={deletingId === resume._id}
                        className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition duration-150"
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-200 group-hover:text-white transition line-clamp-1">
                    {resume.fileName}
                  </h3>

                  {/* Timestamp */}
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-1 mb-6">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(resume.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </div>
                </div>

                {/* Score tags */}
                <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Resume Score</span>
                    <span className={`text-md font-extrabold ${resume.atsScore >= 75 ? 'text-emerald-400' : resume.atsScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {resume.atsScore > 0 ? `${resume.atsScore}%` : 'Pending'}
                    </span>
                  </div>

                  {resume.matchScore > 0 && (
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-end space-x-0.5">
                        <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
                        <span>Role Match</span>
                      </span>
                      <span className="text-md font-extrabold text-indigo-400">
                        {resume.matchScore}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
