/**
 * Application Constants and Enums
 * Centralized place for all constant values used across the application
 */

// Question Categories
const CATEGORIES = {
  HR: 'HR',
  TECHNICAL: 'Technical',
  BEHAVIORAL: 'Behavioral',
  MIXED: 'Mixed'
};

const CATEGORY_LIST = Object.values(CATEGORIES);
const QUESTION_CATEGORIES = [CATEGORIES.HR, CATEGORIES.TECHNICAL, CATEGORIES.BEHAVIORAL];

// Difficulty Levels
const DIFFICULTY = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  MIXED: 'Mixed'
};

const DIFFICULTY_LIST = Object.values(DIFFICULTY);
const QUESTION_DIFFICULTIES = [DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD];

// Session Status
const SESSION_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Question Modes
const QUESTION_MODE = {
  BANK: 'bank',
  AI_PROFILE: 'ai_profile',
  AI_RESUME: 'ai_resume'
};

// Evaluation Types
const EVALUATION_TYPE = {
  AI: 'AI',
  KEYWORD: 'keyword'
};

// Score Grades
const SCORE_GRADES = {
  EXCELLENT: { min: 90, label: 'Excellent', color: '#22c55e' },
  VERY_GOOD: { min: 80, label: 'Very Good', color: '#4ade80' },
  GOOD: { min: 70, label: 'Good', color: '#84cc16' },
  FAIR: { min: 60, label: 'Fair', color: '#facc15' },
  NEEDS_IMPROVEMENT: { min: 0, label: 'Needs Improvement', color: '#ef4444' }
};

/**
 * Get grade based on score
 * @param {number} score - The score value (0-100)
 * @returns {object} Grade object with label and color
 */
const getScoreGrade = (score) => {
  if (score >= SCORE_GRADES.EXCELLENT.min) return SCORE_GRADES.EXCELLENT;
  if (score >= SCORE_GRADES.VERY_GOOD.min) return SCORE_GRADES.VERY_GOOD;
  if (score >= SCORE_GRADES.GOOD.min) return SCORE_GRADES.GOOD;
  if (score >= SCORE_GRADES.FAIR.min) return SCORE_GRADES.FAIR;
  return SCORE_GRADES.NEEDS_IMPROVEMENT;
};

// API Response Messages
const MESSAGES = {
  // Success messages
  SESSION_CREATED: 'Interview session created successfully',
  RESPONSE_SAVED: 'Response saved successfully',
  QUESTION_CREATED: 'Question created successfully',
  QUESTION_UPDATED: 'Question updated successfully',
  QUESTION_DELETED: 'Question deleted successfully',
  EVALUATION_COMPLETE: 'Evaluation completed successfully',
  
  // Error messages
  SESSION_NOT_FOUND: 'Session not found',
  QUESTION_NOT_FOUND: 'Question not found',
  INVALID_REQUEST: 'Invalid request data',
  SERVER_ERROR: 'An unexpected error occurred',
  OPENAI_ERROR: 'AI service temporarily unavailable',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  
  // Validation messages
  CANDIDATE_NAME_REQUIRED: 'Candidate name is required',
  QUESTION_ID_REQUIRED: 'Question ID is required',
  TRANSCRIPTION_REQUIRED: 'Transcription is required'
};

// OpenAI Configuration
const OPENAI_CONFIG = {
  MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  MAX_TOKENS: {
    EVALUATION: 500,
    QUESTION_GENERATION: 2000,
    CAREER_ADVICE: 1500
  },
  TEMPERATURE: {
    EVALUATION: 0.7,
    QUESTION_GENERATION: 0.8,
    CAREER_ADVICE: 0.7
  }
};

// File Upload Configuration
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024,
  ALLOWED_AUDIO_TYPES: ['audio/wav', 'audio/webm', 'audio/mp3', 'audio/mpeg'],
  ALLOWED_RESUME_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads'
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

module.exports = {
  CATEGORIES,
  CATEGORY_LIST,
  QUESTION_CATEGORIES,
  DIFFICULTY,
  DIFFICULTY_LIST,
  QUESTION_DIFFICULTIES,
  SESSION_STATUS,
  QUESTION_MODE,
  EVALUATION_TYPE,
  SCORE_GRADES,
  getScoreGrade,
  MESSAGES,
  OPENAI_CONFIG,
  UPLOAD_CONFIG,
  PAGINATION
};
