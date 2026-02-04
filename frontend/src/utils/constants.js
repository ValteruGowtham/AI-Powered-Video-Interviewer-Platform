/**
 * Frontend Constants
 * Centralized configuration for the frontend application
 */

// Question Categories
export const CATEGORIES = {
  HR: 'HR',
  TECHNICAL: 'Technical',
  BEHAVIORAL: 'Behavioral',
  MIXED: 'Mixed'
};

export const CATEGORY_OPTIONS = [
  { value: 'HR', label: 'HR / General' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Behavioral', label: 'Behavioral' },
  { value: 'Mixed', label: 'Mixed (All Categories)' }
];

// Difficulty Levels
export const DIFFICULTY = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  MIXED: 'Mixed'
};

export const DIFFICULTY_OPTIONS = [
  { value: 'Easy', label: 'Easy', color: '#22c55e' },
  { value: 'Medium', label: 'Medium', color: '#f59e0b' },
  { value: 'Hard', label: 'Hard', color: '#ef4444' },
  { value: 'Mixed', label: 'Mixed (All Levels)', color: '#6366f1' }
];

// Score Grades
export const SCORE_GRADES = {
  EXCELLENT: { min: 90, label: 'Excellent', color: '#22c55e', emoji: '🌟' },
  VERY_GOOD: { min: 80, label: 'Very Good', color: '#4ade80', emoji: '✨' },
  GOOD: { min: 70, label: 'Good', color: '#84cc16', emoji: '👍' },
  FAIR: { min: 60, label: 'Fair', color: '#facc15', emoji: '📈' },
  NEEDS_IMPROVEMENT: { min: 0, label: 'Needs Improvement', color: '#ef4444', emoji: '💪' }
};

/**
 * Get grade based on score
 */
export const getScoreGrade = (score) => {
  if (score >= SCORE_GRADES.EXCELLENT.min) return SCORE_GRADES.EXCELLENT;
  if (score >= SCORE_GRADES.VERY_GOOD.min) return SCORE_GRADES.VERY_GOOD;
  if (score >= SCORE_GRADES.GOOD.min) return SCORE_GRADES.GOOD;
  if (score >= SCORE_GRADES.FAIR.min) return SCORE_GRADES.FAIR;
  return SCORE_GRADES.NEEDS_IMPROVEMENT;
};

/**
 * Get score color based on value
 */
export const getScoreColor = (score) => {
  return getScoreGrade(score).color;
};

// Question Modes
export const QUESTION_MODES = {
  BANK: 'bank',
  AI_PROFILE: 'ai_profile',
  AI_RESUME: 'ai_resume'
};

export const QUESTION_MODE_OPTIONS = [
  { value: 'bank', label: 'Question Bank', icon: '📚', description: 'Use curated questions from our database' },
  { value: 'ai_profile', label: 'AI Generated', icon: '🤖', description: 'Generate questions for your target role' }
];

// Interview Settings Defaults
export const DEFAULT_INTERVIEW_SETTINGS = {
  defaultNumQuestions: 5,
  minQuestions: 3,
  maxQuestions: 10,
  allowUserQuestionCount: false
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_RECORDING: ' ', // Space
  STOP_RECORDING: 'Escape',
  NEXT_QUESTION: 'Enter',
  SKIP_QUESTION: 'KeyS'
};

// Animation Durations (ms)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  PAGE_TRANSITION: 400
};

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_AUDIO_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_RESUME_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_RESUME_TYPES: ['.pdf', '.docx'],
  ALLOWED_AUDIO_TYPES: ['audio/webm', 'audio/wav', 'audio/mp3']
};

// Local Storage Keys
export const STORAGE_KEYS = {
  INTERVIEW_SETTINGS: 'interviewSettings',
  THEME: 'theme',
  LAST_SESSION: 'lastSession',
  USER_PREFERENCES: 'userPreferences'
};

export default {
  CATEGORIES,
  CATEGORY_OPTIONS,
  DIFFICULTY,
  DIFFICULTY_OPTIONS,
  SCORE_GRADES,
  getScoreGrade,
  getScoreColor,
  QUESTION_MODES,
  QUESTION_MODE_OPTIONS,
  DEFAULT_INTERVIEW_SETTINGS,
  KEYBOARD_SHORTCUTS,
  ANIMATION_DURATIONS,
  UPLOAD_LIMITS,
  STORAGE_KEYS
};
