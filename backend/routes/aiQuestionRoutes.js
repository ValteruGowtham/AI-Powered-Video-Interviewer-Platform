const express = require('express');
const router = express.Router();
const {
  generateQuestions,
  saveGeneratedQuestions,
  regenerateSingleQuestion
} = require('../controllers/aiQuestionController');
const { evaluationLimiter } = require('../middleware/rateLimiter');

// POST /api/ai-questions/generate - Generate new questions
router.post('/generate', evaluationLimiter, generateQuestions);

// POST /api/ai-questions/save - Save generated questions to database
router.post('/save', saveGeneratedQuestions);

// POST /api/ai-questions/regenerate - Regenerate a single question
router.post('/regenerate', evaluationLimiter, regenerateSingleQuestion);

module.exports = router;
