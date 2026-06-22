import express from 'express';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  uploadResume,
  extractSkills,
  calculateAtsScore,
  matchJobDescription,
  generateSuggestions,
  getHistory,
  getResumeById,
  deleteResume
} from '../controllers/resumeController.js';

const router = express.Router();

router.get('/history', protect, getHistory);
router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);
router.post('/:id/extract', protect, extractSkills);
router.post('/:id/ats-score', protect, calculateAtsScore);
router.post('/:id/match', protect, matchJobDescription);
router.post('/:id/suggestions', protect, generateSuggestions);

export default router;
