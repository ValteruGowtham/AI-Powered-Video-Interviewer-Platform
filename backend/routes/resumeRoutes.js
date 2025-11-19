const express = require('express');
const router = express.Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const {
  uploadAndAnalyzeResume,
  generateQuestionsFromResume,
  generateQuestionsFromProfile
} = require('../controllers/resumeController');

// Configure multer for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
    }
  }
});

// Rate limiter for resume endpoints (prevent abuse)
const resumeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many resume uploads, please try again later'
});

const questionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: 'Too many question generation requests, please try again later'
});

// Routes
router.post('/upload', resumeRateLimiter, upload.single('resume'), uploadAndAnalyzeResume);
router.post('/generate-questions', questionRateLimiter, generateQuestionsFromResume);
router.post('/generate-from-profile', questionRateLimiter, generateQuestionsFromProfile);

module.exports = router;
