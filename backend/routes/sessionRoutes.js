const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const {
  createSession,
  saveResponse,
  getSessionById,
  getAllSessions,
  updateSessionFeedback,
  deleteSession,
  saveFollowupResponse
} = require('../controllers/sessionController');
const { validateSession, validateResponse, validateMongoId } = require('../middleware/validation');
const { sessionCreationLimiter } = require('../middleware/rateLimiter');

// GET routes
router.get('/', getAllSessions);
router.get('/:sessionId', validateMongoId, getSessionById);

// POST routes
router.post('/', sessionCreationLimiter, validateSession, createSession);
router.post('/:sessionId/response', upload.single('video'), validateResponse, saveResponse); // Changed 'audio' to 'video'
router.post('/:sessionId/followup', validateMongoId, saveFollowupResponse);

// PUT routes
router.put('/:sessionId/feedback', validateMongoId, updateSessionFeedback);

// DELETE routes
router.delete('/:sessionId', validateMongoId, deleteSession);

module.exports = router;
