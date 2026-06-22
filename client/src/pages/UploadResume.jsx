import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadDropzone from '../components/UploadDropzone';
import { Cpu, Award, Zap } from 'lucide-react';
import api from '../services/api';

const UploadResume = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Direct navigation to dashboard for analysis
      navigate(`/dashboard/${data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
          Refine Your Resume for Your{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Next Big Opportunity
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Get friendly, structured advice on your resume. We'll check your document formatting, list key skills, and highlight opportunities to improve your content.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="mb-16">
        <UploadDropzone onUpload={handleUpload} isUploading={isUploading} />
        {error && (
          <div className="mt-4 max-w-2xl mx-auto text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white mb-2">Role Alignment Check</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            We map your experiences to standard job specifications, showing where your profile aligns and where you can expand.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
            <Award className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white mb-2">Resume Health Rating</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Get clear feedback on your layout structures, headers, contact detail availability, and how well you describe your impact.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-pink-500/10">
          <div className="w-10 h-10 rounded-xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white mb-2">Actionable Checklist</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Receive targeted rewriting recommendations from career advisors to help your resume stand out to hiring managers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
