const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  generateFollowup,
  generateMultipleFollowups
} = require('../controllers/followupController');

// Rate limiter for follow-up generation
const followupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: 'Too many follow-up requests, please try again later'
});

// Routes
router.post('/generate', followupRateLimiter, generateFollowup);
router.post('/generate-multiple', followupRateLimiter, generateMultipleFollowups);

module.exports = router;
