const { body, param, validationResult } = require('express-validator');

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Question validation rules
const validateQuestion = [
  body('text')
    .trim()
    .notEmpty().withMessage('Question text is required')
    .isLength({ min: 10, max: 500 }).withMessage('Question must be 10-500 characters'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['HR', 'Technical', 'Behavioral']).withMessage('Invalid category'),
  
  body('difficulty')
    .trim()
    .notEmpty().withMessage('Difficulty is required')
    .isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty'),
  
  body('expectedKeywords')
    .optional()
    .isArray().withMessage('Expected keywords must be an array')
    .custom((keywords) => {
      if (keywords && keywords.length > 20) {
        throw new Error('Maximum 20 keywords allowed');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Session validation rules
const validateSession = [
  body('candidateName')
    .trim()
    .notEmpty().withMessage('Candidate name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name contains invalid characters'),
  
  body('category')
    .optional()
    .trim()
    .isIn(['HR', 'Technical', 'Behavioral', 'Mixed']).withMessage('Invalid category'),
  
  body('difficulty')
    .optional()
    .trim()
    .isIn(['Easy', 'Medium', 'Hard', 'Mixed']).withMessage('Invalid difficulty'),
  
  body('numQuestions')
    .optional()
    .isInt({ min: 3, max: 10 }).withMessage('Number of questions must be 3-10'),
  
  handleValidationErrors
];

// Response validation rules
const validateResponse = [
  param('id')
    .isMongoId().withMessage('Invalid session ID'),
  
  body('questionId')
    .isMongoId().withMessage('Invalid question ID'),
  
  body('candidateAnswer')
    .trim()
    .notEmpty().withMessage('Answer is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Answer must be 10-2000 characters'),
  
  body('score')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Score must be 0-100'),
  
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Feedback must not exceed 1000 characters'),
  
  handleValidationErrors
];

// Evaluation validation rules
const validateEvaluation = [
  body('question')
    .trim()
    .notEmpty().withMessage('Question is required')
    .isLength({ max: 500 }).withMessage('Question too long'),
  
  body('answer')
    .trim()
    .notEmpty().withMessage('Answer is required')
    .isLength({ min: 5, max: 2000 }).withMessage('Answer must be 5-2000 characters'),
  
  body('expectedKeywords')
    .optional()
    .isArray().withMessage('Expected keywords must be an array'),
  
  handleValidationErrors
];

// MongoDB ID validation
const validateMongoId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Query parameter validation for random questions
const validateRandomQuestions = [
  body('category')
    .optional()
    .trim()
    .isIn(['HR', 'Technical', 'Behavioral', 'Mixed']).withMessage('Invalid category'),
  
  body('difficulty')
    .optional()
    .trim()
    .isIn(['Easy', 'Medium', 'Hard', 'Mixed']).withMessage('Invalid difficulty'),
  
  body('count')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Count must be 1-10'),
  
  handleValidationErrors
];

module.exports = {
  validateQuestion,
  validateSession,
  validateResponse,
  validateEvaluation,
  validateMongoId,
  validateRandomQuestions,
  handleValidationErrors
};
