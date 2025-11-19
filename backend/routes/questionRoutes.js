const express = require('express');
const router = express.Router();
const {
  addQuestion,
  getAllQuestions,
  getQuestionsByCategory,
  getQuestionsByDifficulty,
  getRandomQuestions,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');
const { validateQuestion, validateMongoId, validateRandomQuestions } = require('../middleware/validation');
const { questionMutationLimiter } = require('../middleware/rateLimiter');

// GET routes
router.get('/', getAllQuestions);
router.post('/random', validateRandomQuestions, getRandomQuestions);
router.get('/category/:category', getQuestionsByCategory);
router.get('/difficulty/:difficulty', getQuestionsByDifficulty);

// POST routes
router.post('/', questionMutationLimiter, validateQuestion, addQuestion);

// PUT routes
router.put('/:id', questionMutationLimiter, validateMongoId, validateQuestion, updateQuestion);

// DELETE routes
router.delete('/:id', questionMutationLimiter, validateMongoId, deleteQuestion);

module.exports = router;
