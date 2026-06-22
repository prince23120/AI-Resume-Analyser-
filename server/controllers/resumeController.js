import Resume from '../models/Resume.js';
import { parsePdf } from '../utils/pdfParser.js';
import { getAIJSONCompletion } from '../config/aiClient.js';
import {
  JSON_SYSTEM_INSTRUCTION,
  getExtractPrompt,
  getAtsScorePrompt,
  getJobMatchPrompt,
  getSuggestionsPrompt
} from '../utils/aiPrompts.js';

/**
 * Helper to check ownership of a resume.
 */
const verifyResumeOwnership = async (resumeId, userId) => {
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new Error('Resume not found');
  }
  if (resume.userId.toString() !== userId.toString()) {
    throw new Error('Not authorized to access this resume');
  }
  return resume;
};

/**
 * @desc Upload a PDF resume and parse text
 * @route POST /api/resume/upload
 * @access Private
 */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    console.log(`Parsing PDF file: ${req.file.originalname}`);
    const rawText = await parsePdf(req.file.buffer);

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ message: 'Successfully parsed PDF, but no readable text was found' });
    }

    // Save to Database
    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      rawText: rawText
    });

    return res.status(201).json(resume);
  } catch (error) {
    console.error('Upload resume error:', error);
    return res.status(500).json({ message: error.message || 'Server error uploading resume' });
  }
};

/**
 * @desc Extract skills and details from resume using AI
 * @route POST /api/resume/:id/extract
 * @access Private
 */
export const extractSkills = async (req, res) => {
  try {
    const resume = await verifyResumeOwnership(req.params.id, req.user._id);

    // Cache check: if already extracted, return cached version
    if (resume.skills && resume.skills.length > 0) {
      console.log('Returning cached skills extraction for resume:', resume._id);
      return res.json(resume);
    }

    const prompt = getExtractPrompt(resume.rawText);
    console.log('Sending skill extraction request to AI for resume:', resume._id);
    const extraction = await getAIJSONCompletion(prompt, JSON_SYSTEM_INSTRUCTION);

    // Save extracted results
    resume.skills = extraction.skills || [];
    resume.experienceYears = extraction.experienceYears || 0;
    resume.education = extraction.education || [];
    resume.jobTitles = extraction.jobTitles || [];
    await resume.save();

    return res.json(resume);
  } catch (error) {
    console.error('Extract skills error:', error);
    return res.status(500).json({ message: error.message || 'AI extraction failed' });
  }
};

/**
 * @desc Calculate ATS score using AI rubric
 * @route POST /api/resume/:id/ats-score
 * @access Private
 */
export const calculateAtsScore = async (req, res) => {
  try {
    const resume = await verifyResumeOwnership(req.params.id, req.user._id);

    // Cache check
    if (resume.atsScore > 0) {
      console.log('Returning cached ATS score for resume:', resume._id);
      return res.json({ score: resume.atsScore, breakdown: resume.atsBreakdown });
    }

    const prompt = getAtsScorePrompt(resume.rawText);
    console.log('Sending ATS scoring request to AI for resume:', resume._id);
    const result = await getAIJSONCompletion(prompt, JSON_SYSTEM_INSTRUCTION);

    // Save scoring details
    resume.atsScore = result.score || 0;
    resume.atsBreakdown = {
      formatting: result.breakdown?.formatting || 0,
      sectionHeaders: result.breakdown?.sectionHeaders || 0,
      keywordDensity: result.breakdown?.keywordDensity || 0,
      quantifiedAchievements: result.breakdown?.quantifiedAchievements || 0,
      contactInfo: result.breakdown?.contactInfo || 0,
      details: result.breakdown?.details || ''
    };
    await resume.save();

    return res.json({ score: resume.atsScore, breakdown: resume.atsBreakdown });
  } catch (error) {
    console.error('Calculate ATS score error:', error);
    return res.status(500).json({ message: error.message || 'ATS scoring failed' });
  }
};

/**
 * @desc Match resume with job description
 * @route POST /api/resume/:id/match
 * @access Private
 */
export const matchJobDescription = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide job description text' });
    }

    const resume = await verifyResumeOwnership(req.params.id, req.user._id);

    // Cache check: if same JD, return cached matching metrics
    if (resume.jobDescription === jobDescription && resume.matchScore > 0) {
      console.log('Returning cached JD match results for resume:', resume._id);
      return res.json({
        matchScore: resume.matchScore,
        matchedKeywords: resume.matchedKeywords,
        missingKeywords: resume.missingKeywords
      });
    }

    const prompt = getJobMatchPrompt(resume.rawText, jobDescription);
    console.log('Sending JD matching request to AI for resume:', resume._id);
    const result = await getAIJSONCompletion(prompt, JSON_SYSTEM_INSTRUCTION);

    // Save matching results
    resume.jobDescription = jobDescription;
    resume.matchScore = result.matchScore || 0;
    resume.matchedKeywords = result.matchedKeywords || [];
    resume.missingKeywords = result.missingKeywords || [];
    
    // Clear old suggestions if JD changed, so new suggestions can be calculated on subsequent requests
    if (resume.isModified('jobDescription')) {
      resume.suggestions = [];
    }

    await resume.save();

    return res.json({
      matchScore: resume.matchScore,
      matchedKeywords: resume.matchedKeywords,
      missingKeywords: resume.missingKeywords
    });
  } catch (error) {
    console.error('Job matching error:', error);
    return res.status(500).json({ message: error.message || 'Job matching failed' });
  }
};

/**
 * @desc Generate improvement suggestions
 * @route POST /api/resume/:id/suggestions
 * @access Private
 */
export const generateSuggestions = async (req, res) => {
  try {
    const resume = await verifyResumeOwnership(
      req.params.id,
      req.user._id
    );

    // Return cached suggestions if already generated
    if (resume.suggestions && resume.suggestions.length > 0) {
      console.log('Returning cached suggestions for resume:', resume._id);
      return res.json(resume.suggestions);
    }

    const prompt = getSuggestionsPrompt(
      resume.rawText,
      resume.jobDescription
    );

    console.log(
      'Sending suggestions generation request to AI for resume:',
      resume._id
    );

    const result = await getAIJSONCompletion(
      prompt,
      JSON_SYSTEM_INSTRUCTION
    );

    const suggestions = result.suggestions || [];

    // Update directly in MongoDB to avoid VersionError
    await Resume.findByIdAndUpdate(
      resume._id,
      {
        $set: {
          suggestions: suggestions
        }
      },
      {
        new: true
      }
    );

    return res.json(suggestions);

  } catch (error) {
    console.error('Suggestions generation error:', error);

    return res.status(500).json({
      message: error.message || 'Suggestions generation failed'
    });
  }
};
/**
 * @desc Get all user resumes (history list)
 * @route GET /api/resume/history
 * @access Private
 */
export const getHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-rawText')
      .sort({ createdAt: -1 });

    return res.json(resumes);
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({
      message: 'Failed to fetch resume history'
    });
  }
};
/**
 * @desc Get detailed resume by ID
 * @route GET /api/resume/:id
 * @access Private
 */
export const getResumeById = async (req, res) => {
  try {
    const resume = await verifyResumeOwnership(req.params.id, req.user._id);
    return res.json(resume);
  } catch (error) {
    console.error('Get resume error:', error);
    return res.status(error.message === 'Resume not found' ? 404 : 401).json({ message: error.message });
  }
};

/**
 * @desc Delete resume by ID
 * @route DELETE /api/resume/:id
 * @access Private
 */
export const deleteResume = async (req, res) => {
  try {
    const resume = await verifyResumeOwnership(req.params.id, req.user._id);
    await resume.deleteOne();
    return res.json({ id: req.params.id, message: 'Resume removed successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    return res.status(500).json({ message: error.message || 'Delete operation failed' });
  }
};
