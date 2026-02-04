# Changelog

All notable changes to the AI Mock Interviewer project will be documented in this file.

## [0.2.0] - 2026-02-04

### Added

#### Backend
- **Error Handling System** (`backend/utils/errorHandler.js`)
  - Custom error classes (NotFoundError, ValidationError, OpenAIError, etc.)
  - Async handler wrapper for cleaner controller code
  - Global error middleware with consistent response format
  - 404 handler for undefined routes

- **Logger Utility** (`backend/utils/logger.js`)
  - Structured logging with timestamps
  - Configurable log levels (ERROR, WARN, INFO, DEBUG)
  - Request logging middleware for HTTP request tracking

- **OpenAI Service** (`backend/utils/openaiService.js`)
  - Centralized OpenAI API wrapper
  - Retry logic for failed requests
  - JSON response parsing with error handling
  - Reusable methods for questions, evaluation, and career advice

- **Constants & Configuration** (`backend/config/constants.js`)
  - Centralized enums for categories, difficulty, session status
  - Score grade definitions with colors
  - API response messages
  - Upload and pagination configuration

- **Security Improvements**
  - Added `helmet` package for security headers
  - Configurable CORS origins via environment variables
  - Graceful shutdown handling
  - Unhandled rejection and exception handling

- **Health Check Endpoint** (`/health`)
  - Returns server status, timestamp, and uptime

#### Frontend
- **API Service Layer** (`frontend/src/services/`)
  - Axios instance with interceptors (`api.js`)
  - Comprehensive interview service (`interviewService.js`)
  - Automatic error handling and request logging

- **Custom React Hooks** (`frontend/src/hooks/`)
  - `useApi` - Generic hook for API calls with loading/error states
  - `useSpeechRecognition` - Speech-to-text functionality
  - `useSpeechSynthesis` - Text-to-speech functionality  
  - `useAudioRecorder` - Audio recording with MediaRecorder
  - `useAudioVisualization` - Real-time audio level visualization
  - `useLocalStorage` - Persistent state with localStorage sync

- **Skeleton Loading Components** (`frontend/src/components/Skeleton.jsx`)
  - `Skeleton` - Base skeleton block
  - `SkeletonText` - Multi-line text placeholder
  - `SkeletonCard` - Card placeholder
  - `SkeletonTable` - Table placeholder
  - `SkeletonReport` - Report page placeholder

- **Error Boundary Component** (`frontend/src/components/ErrorBoundary.jsx`)
  - Catches JavaScript errors in component tree
  - Displays user-friendly error messages
  - Shows error details in development mode
  - Retry and go home options

- **Button Component** (`frontend/src/components/Button.jsx`)
  - Multiple variants (primary, secondary, success, danger, etc.)
  - Size options (small, medium, large)
  - Loading state with spinner
  - Icon support with positioning

- **Utility Functions** (`frontend/src/utils/`)
  - Date formatting (absolute and relative)
  - Text utilities (truncate, capitalize)
  - Array utilities (groupBy, sortBy)
  - Browser feature detection
  - Clipboard and download utilities

- **Constants** (`frontend/src/utils/constants.js`)
  - Category and difficulty options
  - Score grade definitions
  - Keyboard shortcuts
  - Storage keys
  - Upload limits

- **Improved Vite Configuration**
  - Path aliases for cleaner imports (@components, @hooks, etc.)
  - API proxy for development
  - Build optimizations with chunk splitting
  - Source maps for debugging

- **JSConfig for VS Code** (`frontend/jsconfig.json`)
  - Path alias support for IntelliSense
  - Improved TypeScript-like checking

### Changed
- Updated `backend/index.js` with:
  - Helmet security middleware
  - Request logging
  - Error handling middleware
  - Graceful shutdown
  - Health check endpoint

- Updated `frontend/src/App.jsx` with:
  - ErrorBoundary wrapper for crash protection

### Dependencies
- Added `helmet` to backend dependencies

## [0.1.0] - Initial Release

### Features
- AI-powered interview evaluation using OpenAI GPT-3.5
- Voice-based interviews with Web Speech API
- Question bank management
- AI question generation
- Resume analysis
- Follow-up questions
- Career advisor
- Comprehensive interview reports
