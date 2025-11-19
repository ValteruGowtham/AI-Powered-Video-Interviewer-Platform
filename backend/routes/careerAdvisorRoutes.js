const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  generateCareerAdvice,
  getCareerAdvice,
  generateQuickTips
} = require('../controllers/careerAdvisorController');

// Rate limiter for career advisor (resource-intensive)
const careerAdvisorRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many career advice requests, please try again later'
});

// Routes
router.post('/generate/:sessionId', careerAdvisorRateLimiter, generateCareerAdvice);
router.get('/:sessionId', getCareerAdvice);
router.post('/quick-tips', careerAdvisorRateLimiter, generateQuickTips);

module.exports = router;
