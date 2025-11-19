const express = require('express');
const router = express.Router();
const { generateSummary } = require('../controllers/summaryController');

// POST route to generate summary for a session
router.post('/:sessionId/generate-summary', generateSummary);

module.exports = router;
