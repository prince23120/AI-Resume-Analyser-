import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    education: {
      type: [String],
      default: [],
    },
    jobTitles: {
      type: [String],
      default: [],
    },
    atsScore: {
      type: Number,
      default: 0,
    },
    atsBreakdown: {
      formatting: { type: Number, default: 0 },
      sectionHeaders: { type: Number, default: 0 },
      keywordDensity: { type: Number, default: 0 },
      quantifiedAchievements: { type: Number, default: 0 },
      contactInfo: { type: Number, default: 0 },
      details: { type: String, default: '' },
    },
    jobDescription: {
      type: String,
      default: '',
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    matchedKeywords: {
      type: [String],
      default: [],
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
