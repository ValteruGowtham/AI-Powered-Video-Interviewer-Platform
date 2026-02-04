/**
 * Interview Service
 * API methods for interview sessions, questions, and evaluations
 */
import api from './api';

export const interviewService = {
  // ================== Sessions ==================
  
  /**
   * Create a new interview session
   */
  createSession: async (sessionData) => {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  },

  /**
   * Get session by ID with all details
   */
  getSession: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Get all sessions (with optional pagination)
   */
  getAllSessions: async (page = 1, limit = 20) => {
    const response = await api.get('/sessions', { params: { page, limit } });
    return response.data;
  },

  /**
   * Save response to a question (with optional audio)
   */
  saveResponse: async (sessionId, responseData, audioBlob = null) => {
    const formData = new FormData();
    formData.append('questionId', responseData.questionId);
    formData.append('transcription', responseData.transcription);
    formData.append('question', responseData.question || '');
    
    if (audioBlob) {
      formData.append('audio', audioBlob, 'response.webm');
    }

    const response = await api.post(`/sessions/${sessionId}/response`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Complete session and get summary
   */
  completeSession: async (sessionId) => {
    const response = await api.post(`/summary/${sessionId}/generate-summary`);
    return response.data;
  },

  // ================== Questions ==================

  /**
   * Get questions from question bank
   */
  getQuestions: async (filters = {}) => {
    const response = await api.get('/questions', { params: filters });
    return response.data;
  },

  /**
   * Get a single question by ID
   */
  getQuestion: async (questionId) => {
    const response = await api.get(`/questions/${questionId}`);
    return response.data;
  },

  /**
   * Create a new question
   */
  createQuestion: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  /**
   * Update an existing question
   */
  updateQuestion: async (questionId, questionData) => {
    const response = await api.put(`/questions/${questionId}`, questionData);
    return response.data;
  },

  /**
   * Delete a question
   */
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  },

  // ================== AI Features ==================

  /**
   * Generate AI questions based on topic/role
   */
  generateAIQuestions: async (params) => {
    const response = await api.post('/ai-questions/generate', params);
    return response.data;
  },

  /**
   * Regenerate a single AI question
   */
  regenerateQuestion: async (params) => {
    const response = await api.post('/ai-questions/regenerate', params);
    return response.data;
  },

  /**
   * Save AI-generated questions to bank
   */
  saveAIQuestions: async (questions) => {
    const response = await api.post('/ai-questions/save', { questions });
    return response.data;
  },

  // ================== Evaluation ==================

  /**
   * Evaluate a response
   */
  evaluateResponse: async (questionId, transcription) => {
    const response = await api.post('/evaluate', { questionId, transcription });
    return response.data;
  },

  /**
   * Generate follow-up question based on response
   */
  generateFollowup: async (params) => {
    const response = await api.post('/followup/generate', params);
    return response.data;
  },

  /**
   * Evaluate a follow-up response
   */
  evaluateFollowup: async (params) => {
    const response = await api.post('/followup/evaluate', params);
    return response.data;
  },

  // ================== Resume ==================

  /**
   * Upload and analyze resume
   */
  analyzeResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post('/resume/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // ================== Career Advisor ==================

  /**
   * Generate career advice based on interview performance
   */
  getCareerAdvice: async (sessionId) => {
    const response = await api.post(`/career-advisor/generate/${sessionId}`);
    return response.data;
  }
};

export default interviewService;
