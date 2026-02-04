/**
 * API Configuration and Axios Instance
 * Centralized API client with interceptors for error handling
 */
import axios from 'axios';

// API Base URL - can be configured via environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging and token injection
api.interceptors.request.use(
  (config) => {
    // Add timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`[API] Response received in ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    // Handle different error types
    const errorResponse = {
      message: 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data
    };

    if (error.code === 'ECONNABORTED') {
      errorResponse.message = 'Request timed out. Please try again.';
    } else if (!error.response) {
      errorResponse.message = 'Unable to connect to server. Please check your connection.';
    } else if (error.response.status === 429) {
      errorResponse.message = 'Too many requests. Please wait a moment and try again.';
    } else if (error.response.status >= 500) {
      errorResponse.message = 'Server error. Please try again later.';
    } else if (error.response.data?.message) {
      errorResponse.message = error.response.data.message;
    }

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('[API Error]', errorResponse);
    }

    return Promise.reject(errorResponse);
  }
);

export default api;
