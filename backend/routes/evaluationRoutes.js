const express = require('express');
const router = express.Router();
const {
  evaluateResponse,
  evaluateSession
} = require('../controllers/evaluationController');
const { validateEvaluation, validateMongoId } = require('../middleware/validation');
const { evaluationLimiter } = require('../middleware/rateLimiter');

// POST /api/evaluate - Evaluate a single response
router.post('/', evaluationLimiter, validateEvaluation, evaluateResponse);

// POST /api/evaluate/session/:sessionId - Evaluate entire session
router.post('/session/:sessionId', evaluationLimiter, validateMongoId, evaluateSession);

module.exports = router;
